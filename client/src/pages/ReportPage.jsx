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
  Plus
  AlignLeft
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

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

  // Parse URL parameters for pre-filled data
  useEffect(() => {
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
    setLoading(true);
    setError('');

    try {
      // Confidence is set to 1.0 for manual user reports
      await api.post('/potholes/detect', {
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        severityLevel: formData.severityLevel,
        confidence: 1.0,
        imageUrl: formData.imageUrl || 'https://images.unsplash.com/photo-1544376798-89aa6b82c6cd?q=80&w=1000&auto=format&fit=crop',
        description: formData.description
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
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-2xl border border-gray-100 relative overflow-hidden text-left">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                 <AlertTriangle size={120} />
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-center text-red-700">
                  <Info className="w-5 h-5 mr-3 flex-shrink-0" />
                  <p className="font-bold text-xs md:text-sm tracking-tight">{error}</p>
                </div>
              )}

              {/* Location Section */}
              <div className="mb-8">
                <label className="flex items-center text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">
                  <MapPin size={12} className="mr-2" /> 
                  Geospatial Coordinates
                </label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="relative group text-left">
                    <input
                      type="number"
                      step="any"
                      required
                      placeholder="Latitude"
                      className="w-full pl-4 pr-10 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#1a237e] focus:bg-white transition-all outline-none"
                      value={formData.latitude}
                      onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300">N</div>
                  </div>
                  <div className="relative group">
                    <input
                      type="number"
                      step="any"
                      required
                      placeholder="Longitude"
                      className="w-full pl-4 pr-10 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#1a237e] focus:bg-white transition-all outline-none"
                      value={formData.longitude}
                      onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300">E</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={locating}
                  className={`w-full flex items-center justify-center space-x-2 py-3 border rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 ${
                    captureSuccess 
                      ? 'bg-green-50 border-green-200 text-green-700' 
                      : 'bg-blue-50 text-[#1a237e] border-blue-100 hover:bg-blue-100'
                  }`}
                >
                  {locating ? <Loader2 size={16} className="animate-spin" /> : (captureSuccess ? <CheckCircle2 size={16} /> : <Navigation size={16} />)}
                  <span>
                    {locating ? 'Triangulating Satellite Signal...' : (captureSuccess ? 'Coordinates Locked Successfully' : 'Auto-Capture Current Location')}
                  </span>
                </button>
              </div>

              {/* Severity Section */}
              <div className="mb-8 text-left">
                <label className="flex items-center text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">
                  <AlertTriangle size={12} className="mr-2" /> 
                  Observation Severity
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['low', 'medium', 'high'].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setFormData({...formData, severityLevel: level})}
                      className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                        formData.severityLevel === level
                          ? level === 'low' ? 'bg-green-500 border-green-600 text-white shadow-lg shadow-green-500/30' :
                             level === 'medium' ? 'bg-orange-500 border-orange-600 text-white shadow-lg shadow-orange-500/30' :
                             'bg-red-500 border-red-600 text-white shadow-lg shadow-red-500/30'
                          : 'bg-gray-50 border-gray-100 text-gray-400 hover:border-gray-200'
                      }`}
                    >
                      {level === 'low' ? t('map.minor') : level === 'medium' ? t('map.moderate') : t('map.critical')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Visual Evidence Section */}
              <div className="mb-10 text-left">
                <label className="flex items-center text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">
                  <Camera size={12} className="mr-2" /> 
                  Visual Evidence URL
                </label>
                <input
                  type="url"
                  placeholder="Paste image URL (Optional)"
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#1a237e] focus:bg-white transition-all outline-none mb-2 text-left"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                />
                <p className="text-[9px] text-gray-400 font-bold italic pl-1">Visual confirmation accelerates repair prioritization</p>
              </div>

              {/* Description Section */}
              <div className="mb-10">
                <label className="flex items-center text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">
                  <AlignLeft size={12} className="mr-2" /> 
                  Additional Details / Observations
                </label>
                <textarea
                  placeholder="E.g., Located near the north exit, causes heavy traffic slowdown..."
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#1a237e] focus:bg-white transition-all outline-none mb-2 min-h-[100px] resize-y"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
                <p className="text-[9px] text-gray-400 font-bold italic pl-1">Optional context helps field officers prepare appropriate repair materials</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-[#1a237e] text-orange-400 rounded-3xl text-sm font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-[#283593] hover:text-white transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-3"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>{t('common.loading')}...</span>
                  </>
                ) : (
                  <>
                    <span>SUBMIT {t('report.title')}</span>
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
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

