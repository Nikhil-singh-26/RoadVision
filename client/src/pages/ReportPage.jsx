import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import {
  Camera,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Info,
  Navigation,
  BrainCircuit,
  X,
} from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';

const INFERENCE_URL = import.meta.env.VITE_INFERENCE_URL || 'http://localhost:8001';

const ReportPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { search } = useLocation();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    latitude: '',
    longitude: '',
    severityLevel: 'medium',
    imageUrl: '',
    description: ''
  });

  const [locating, setLocating] = useState(false);
  const [captureSuccess, setCaptureSuccess] = useState(false);
  const fileInputRef = useRef(null);

  // Local preview + ML detection state
  const [localPreview, setLocalPreview] = useState('');
  const [detectingPotholes, setDetectingPotholes] = useState(false);
  const [detectionResult, setDetectionResult] = useState(null);
  const [annotatedImageUrl, setAnnotatedImageUrl] = useState('');

  // Auto-capture location on mount
  useEffect(() => {
    handleGetLocation();
    
    const params = new URLSearchParams(search);
    const lat = params.get('lat');
    const lng = params.get('lng');
    const severity = params.get('severity');

    if (lat || lng || severity) {
      setFormData(prev => ({
        ...prev,
        latitude: lat || prev.latitude,
        longitude: lng || prev.longitude,
        severityLevel: severity || prev.severityLevel
      }));
    }
  }, [search]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError('');
    setDetectionResult(null);
    setAnnotatedImageUrl('');

    // Instant local preview (no upload needed)
    const previewUrl = URL.createObjectURL(file);
    setLocalPreview(previewUrl);
    setFormData(prev => ({ ...prev, imageUrl: previewUrl }));

    // Send directly to ML inference service
    setDetectingPotholes(true);

    try {
      const mlFormData = new FormData();
      mlFormData.append('file', file);
      if (formData.latitude) mlFormData.append('latitude', formData.latitude);
      if (formData.longitude) mlFormData.append('longitude', formData.longitude);

      const mlResp = await fetch(`${INFERENCE_URL}/v1/detections/image`, {
        method: 'POST',
        body: mlFormData,
      });

      if (!mlResp.ok) {
        const errText = await mlResp.text().catch(() => '');
        throw new Error(`Inference service error (${mlResp.status}): ${errText}`);
      }

      const detection = await mlResp.json();
      setDetectionResult(detection);

      // Build the annotated image URL from the inference service
      if (detection.annotated_image_url) {
        const annotUrl = detection.annotated_image_url.startsWith('http')
          ? detection.annotated_image_url
          : `${INFERENCE_URL}${detection.annotated_image_url}`;
        setAnnotatedImageUrl(annotUrl);
        // Use annotated image as the submission image
        setFormData(prev => ({ ...prev, imageUrl: annotUrl }));
      }

      // Auto-fill severity from ML results
      if (detection.pothole_count > 0) {
        setFormData(prev => ({
          ...prev,
          severityLevel: detection.overall_severity_level || prev.severityLevel,
          description: `AI Detection: ${detection.pothole_count} pothole(s) found. Severity: ${detection.overall_severity_level} (score: ${detection.overall_severity_score}/100). Confidence: ${(detection.confidence_avg * 100).toFixed(1)}%. ID: ${detection.detection_id}`
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          description: 'AI scan complete — no potholes detected in this image.'
        }));
      }
    } catch (err) {
      console.error("Detection error:", err);
      setError(`AI Detection failed: ${err.message}. Make sure the inference service is running on port 8001.`);
    } finally {
      setDetectingPotholes(false);
    }
  };

  const handleGetLocation = () => {
    setLocating(true);
    setError('');
    setCaptureSuccess(false);

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6)
          });
          setLocating(false);
          setCaptureSuccess(true);
          setTimeout(() => setCaptureSuccess(false), 3000);
        },
        (err) => {
          let msg = t('report.err_fetch_loc');
          if (err.code === err.PERMISSION_DENIED) msg = t('report.err_permission_denied');
          if (err.code === err.TIMEOUT) msg = t('report.err_timeout');
          
          setError(msg);
          setLocating(false);
        },
        options
      );
    } else {
      setError(t('report.err_not_supported'));
      setLocating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.imageUrl) {
      setError("Please upload an image evidence first.");
      return;
    }
    if (!formData.latitude || !formData.longitude) {
      setError("Location coordinates are required. Please enable GPS.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const confidence = detectionResult?.confidence_avg || 1.0;
      await api.post('/potholes/detect', {
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        severityLevel: formData.severityLevel,
        confidence: confidence,
        imageUrl: annotatedImageUrl || formData.imageUrl,
        description: formData.description || 'Reported via mobile image upload'
      });
      
      setSuccess(true);
      setTimeout(() => navigate('/map'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    if (localPreview) URL.revokeObjectURL(localPreview);
    setLocalPreview('');
    setFormData(prev => ({ ...prev, imageUrl: '', description: '' }));
    setDetectionResult(null);
    setAnnotatedImageUrl('');
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 text-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <CheckCircle2 size={48} className="text-green-600" />
        </div>
        <h1 className="text-3xl font-black text-[#1a237e] uppercase tracking-tighter mb-4 italic">{t('report.title')} {t('common.success')}</h1>
        <p className="text-gray-500 max-w-md font-medium mb-8">
          {t('common.success_save')}
        </p>
        <div className="flex space-x-4">
          <button 
            onClick={() => navigate('/map')}
            className="px-8 py-3 bg-[#1a237e] text-white rounded-xl font-bold uppercase tracking-widest text-sm shadow-xl hover:bg-blue-900 transition-all flex items-center"
          >
            {t('nav.map')} <ArrowRight size={18} className="ml-2" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto text-left">
      {/* Header section */}
      <div className="mb-10 text-left">
        <div className="flex items-center space-x-3 text-[#1a237e] mb-2">
          <AlertTriangle size={28} className="text-orange-500" />
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">{t('report.title')}</h1>
        </div>
        <p className="text-sm md:text-base text-gray-500 font-medium italic">{t('report.desc')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6 text-left">
            <div className="bg-white p-6 md:p-12 rounded-[2.5rem] shadow-2xl border border-gray-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:rotate-12 transition-transform duration-700">
                 <Camera size={180} />
              </div>

              {error && (
                <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-2xl flex items-center text-red-700 animate-in fade-in slide-in-from-top-2">
                  <Info className="w-5 h-5 mr-3 flex-shrink-0" />
                  <p className="font-bold text-xs md:text-sm tracking-tight">{error}</p>
                </div>
              )}

              {/* Status Bar */}
              <div className="flex items-center justify-between mb-10 px-4 py-3 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${formData.latitude ? 'bg-green-500 animate-pulse' : 'bg-red-400'}`}></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                    {locating ? t('report.gps_searching') : (formData.latitude ? t('report.gps_active') : t('report.gps_no_signal'))}
                  </span>
                </div>
                {formData.latitude && (
                  <span className="text-[10px] font-mono font-bold text-[#1a237e]/60">
                    {formData.latitude}, {formData.longitude}
                  </span>
                )}
              </div>

              {/* Visual Evidence Section */}
              <div className="mb-10">
                <div 
                  onClick={() => !formData.imageUrl && !detectingPotholes && fileInputRef.current?.click()}
                  className={`relative cursor-pointer group/upload transition-all duration-500 ${
                    formData.imageUrl 
                      ? 'h-auto' 
                      : 'h-80 border-4 border-dashed border-gray-100 bg-gray-50/50 hover:bg-blue-50/50 hover:border-blue-200 rounded-[2rem] flex flex-col items-center justify-center p-8'
                  }`}
                >
                  <input 
                    type="file" 
                    accept="image/*" 
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    className="hidden" 
                  />

                  {!formData.imageUrl ? (
                    <>
                      <div className="w-20 h-20 bg-[#1a237e] text-orange-400 rounded-3xl flex items-center justify-center mb-6 shadow-xl group-hover/upload:scale-110 transition-transform duration-500">
                        <Camera size={32} />
                      </div>
                      <h3 className="text-xl font-black text-[#1a237e] uppercase tracking-tighter mb-2 italic">{t('report.capture')}</h3>
                      <p className="text-sm text-gray-400 font-medium max-w-[200px] text-center italic">{t('report.capture_desc')}</p>
                    </>
                  ) : (
                    <div className="relative rounded-[2rem] overflow-hidden border-[6px] border-white shadow-2xl group/preview">
                      {/* Show annotated image if available, otherwise original */}
                      <img 
                        src={annotatedImageUrl || formData.imageUrl} 
                        alt="Detection Result" 
                        className="w-full h-full object-cover max-h-[400px]"
                      />
                      
                      {/* ML Processing Overlay */}
                      {detectingPotholes && (
                        <div className="absolute inset-0 bg-[#1a237e]/80 backdrop-blur-sm flex items-center justify-center z-10">
                          <div className="flex flex-col items-center text-white">
                            <BrainCircuit size={48} className="animate-pulse mb-4" />
                            <p className="text-sm font-black uppercase tracking-widest mb-2">AI Analyzing...</p>
                            <p className="text-[10px] text-blue-200 font-medium">Running YOLOv8 pothole detection</p>
                          </div>
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover/preview:opacity-100 transition-opacity duration-300 flex items-end p-6">
                        <p className="text-white text-[10px] font-black uppercase tracking-[0.2em] italic">
                          {detectionResult ? 'AI-Analyzed Evidence' : t('report.proof_locked')}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearImage();
                        }}
                        className="absolute top-4 right-4 w-10 h-10 bg-red-500 text-white rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-20"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* ML Detection Results Panel */}
              {detectionResult && (
                <div className="mb-8 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <BrainCircuit size={18} className="text-[#1a237e]" />
                    <span className="text-[10px] font-black uppercase tracking-[.2em] text-[#1a237e]">AI Analysis Complete</span>
                    <CheckCircle2 size={14} className="text-green-500" />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white p-3 rounded-xl text-center shadow-sm">
                      <div className={`text-2xl font-black ${detectionResult.pothole_count > 0 ? 'text-red-500' : 'text-green-500'}`}>
                        {detectionResult.pothole_count}
                      </div>
                      <div className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mt-1">Potholes Found</div>
                    </div>
                    <div className="bg-white p-3 rounded-xl text-center shadow-sm">
                      <div className={`text-2xl font-black ${
                        detectionResult.overall_severity_level === 'high' ? 'text-red-500' :
                        detectionResult.overall_severity_level === 'medium' ? 'text-orange-500' : 'text-green-500'
                      }`}>
                        {detectionResult.overall_severity_level?.toUpperCase() || 'N/A'}
                      </div>
                      <div className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mt-1">Severity</div>
                    </div>
                    <div className="bg-white p-3 rounded-xl text-center shadow-sm">
                      <div className="text-2xl font-black text-[#1a237e]">
                        {detectionResult.confidence_avg ? (detectionResult.confidence_avg * 100).toFixed(0) + '%' : 'N/A'}
                      </div>
                      <div className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mt-1">Confidence</div>
                    </div>
                  </div>

                  {detectionResult.pothole_count === 0 && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                      <p className="text-xs font-bold text-green-700">✅ No potholes detected. You can still submit a manual report if you believe there's a defect.</p>
                    </div>
                  )}

                  {detectionResult.pothole_count > 0 && (
                    <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-xl">
                      <p className="text-xs font-bold text-orange-700">⚠️ {detectionResult.pothole_count} pothole(s) detected — severity auto-set to "{detectionResult.overall_severity_level}". Ready for submission.</p>
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !formData.imageUrl || !formData.latitude || detectingPotholes}
                className={`w-full py-6 rounded-3xl text-sm font-black uppercase tracking-[0.3em] shadow-2xl transition-all active:scale-95 flex items-center justify-center space-x-3 ${
                  !formData.imageUrl || !formData.latitude || detectingPotholes
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : detectionResult?.pothole_count > 0
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-[#1a237e] text-orange-400 hover:bg-[#283593] hover:text-white'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 size={24} className="animate-spin" />
                    <span>{t('report.transmitting')}</span>
                  </>
                ) : detectingPotholes ? (
                  <>
                    <BrainCircuit size={24} className="animate-pulse" />
                    <span>AI Analyzing...</span>
                  </>
                ) : detectionResult?.pothole_count > 0 ? (
                  <>
                    <span>🚨 Submit — {detectionResult.pothole_count} Pothole(s) Detected</span>
                    <ArrowRight size={24} />
                  </>
                ) : (
                  <>
                    <span>{t('report.submit_report')}</span>
                    <ArrowRight size={24} />
                  </>
                )}
              </button>
              
              <p className="text-center mt-6 text-[9px] text-gray-400 font-black uppercase tracking-widest opacity-60">
                Encrypted Data Transmission • Active GPS Tagging • AI-Powered Detection
              </p>
            </div>
          </form>
        </div>

        {/* Sidebar Info/Policy */}
        <div className="space-y-6 text-left">
          <div className="bg-[#1a237e] text-white p-6 rounded-[2rem] shadow-xl relative overflow-hidden text-left">
             <div className="absolute top-[-20px] right-[-20px] opacity-10">
                <Navigation size={120} />
             </div>
             <p className="text-[10px] font-black uppercase tracking-[.2em] text-orange-400 mb-4">Instructions</p>
             <h3 className="text-xl font-black mb-6 leading-tight italic">How to file a valid report</h3>
             <ul className="space-y-4">
                {[
                  { id: '01', text: 'Upload a clear image of the road defect. AI will auto-detect potholes.' },
                  { id: '02', text: 'Enable GPS for precise GIS coordinate mapping.' },
                  { id: '03', text: 'Review AI detection results before submitting.' },
                  { id: '04', text: 'Severity is auto-filled by AI but can be overridden.' }
                ].map((item) => (
                  <li key={item.id} className="flex items-start space-x-3">
                    <span className="text-orange-500 font-black text-xs min-w-[20px]">{item.id}</span>
                    <p className="text-xs font-medium opacity-80 leading-relaxed">{item.text}</p>
                  </li>
                ))}
             </ul>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-blue-50 text-[#1a237e] rounded-2xl">
              <BrainCircuit size={24} />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">AI Engine</p>
              <p className="text-[11px] font-bold text-gray-700 leading-tight">Reports are analyzed by YOLOv8 AI model and verified by field officers.</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-blue-50 text-[#1a237e] rounded-2xl">
              <Info size={24} />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Policy</p>
              <p className="text-[11px] font-bold text-gray-700 leading-tight">Reports are vetted by AI and verified by field officers.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;


