import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import {
  Camera,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Info,
  Navigation,
  ShieldCheck,
  BrainCircuit,
  X,
  Plus,
  AlignLeft
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useRef } from 'react';

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
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  // Auto-capture location on mount
  useEffect(() => {
    handleGetLocation();
    
    // Parse URL parameters for pre-filled data (keep for backward compatibility)
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

    setUploadingImage(true);
    setError('');

    try {
      const storageRef = ref(storage, `potholes/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      
      setFormData(prev => ({ ...prev, imageUrl: url }));
      setCaptureSuccess(true);
      setTimeout(() => setCaptureSuccess(false), 3000);
    } catch (err) {
      console.error("Upload error:", err);
      setError("Failed to upload image. Please try again.");
    } finally {
      setUploadingImage(false);
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
      // Confidence is set to 1.0 for manual user reports
      await api.post('/potholes/detect', {
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        severityLevel: formData.severityLevel,
        confidence: 1.0,
        imageUrl: formData.imageUrl,
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

              {/* Visual Evidence Section - The Hero Interaction */}
              <div className="mb-10">
                <div 
                  onClick={() => !formData.imageUrl && fileInputRef.current?.click()}
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
                        {uploadingImage ? <Loader2 size={32} className="animate-spin" /> : <Camera size={32} />}
                      </div>
                      <h3 className="text-xl font-black text-[#1a237e] uppercase tracking-tighter mb-2 italic">{t('report.capture')}</h3>
                      <p className="text-sm text-gray-400 font-medium max-w-[200px] text-center italic">{t('report.capture_desc')}</p>
                      
                      {uploadingImage && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center rounded-[2rem] z-10">
                           <div className="flex flex-col items-center">
                              <Loader2 size={40} className="text-[#1a237e] animate-spin mb-4" />
                              <p className="text-xs font-black uppercase tracking-widest text-[#1a237e]">{t('report.locating')}</p>
                           </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="relative rounded-[2rem] overflow-hidden border-[6px] border-white shadow-2xl group/preview">
                      <img 
                        src={formData.imageUrl} 
                        alt="Evidence Preview" 
                        className="w-full h-full object-cover max-h-[400px]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover/preview:opacity-100 transition-opacity duration-300 flex items-end p-6">
                        <p className="text-white text-[10px] font-black uppercase tracking-[0.2em] italic">{t('report.proof_locked')}</p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData({...formData, imageUrl: ''});
                        }}
                        className="absolute top-4 right-4 w-10 h-10 bg-red-500 text-white rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !formData.imageUrl || !formData.latitude}
                className={`w-full py-6 rounded-3xl text-sm font-black uppercase tracking-[0.3em] shadow-2xl transition-all active:scale-95 flex items-center justify-center space-x-3 ${
                  !formData.imageUrl || !formData.latitude
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-[#1a237e] text-orange-400 hover:bg-[#283593] hover:text-white'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 size={24} className="animate-spin" />
                    <span>{t('report.transmitting')}</span>
                  </>
                ) : (
                  <>
                    <span>{t('report.submit_report')}</span>
                    <ArrowRight size={24} />
                  </>
                )}
              </button>
              
              <p className="text-center mt-6 text-[9px] text-gray-400 font-black uppercase tracking-widest opacity-60">
                Encrypted Data Transmission • Active GPS Tagging
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
                  { id: '01', text: 'Ensure the defect is clearly visible in optimal lighting.' },
                  { id: '02', text: 'Enable GPS for precise GIS coordinate mapping.' },
                  { id: '03', text: 'Do not stop in the middle of active traffic to report.' }
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

