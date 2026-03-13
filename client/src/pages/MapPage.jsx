import { useState, useEffect } from 'react';
import api from '../services/api';
import { AlertTriangle, ShieldCheck, MapIcon as MapIconLucide, Layers } from 'lucide-react';
import PotholeMap from '../components/PotholeMap';

const MapPage = () => {
  const [potholes, setPotholes] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPotholes();
  }, []);

  const fetchPotholes = async () => {
    try {
      const { data } = await api.get('/potholes');
      setPotholes(data);
    } catch (err) {
      setError('Communication sync failure with central database.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 h-full flex flex-col overflow-hidden">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 md:mb-8 space-y-4 lg:space-y-0">
        <div>
          <div className="flex items-center space-x-2 text-[#1a237e] mb-1">
             <MapIconLucide size={20} className="md:w-6 md:h-6" />
             <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight">Geospatial Surveillance</h1>
          </div>
          <p className="text-[10px] md:text-sm text-gray-500 font-medium italic">Monitoring NH-Series India for structural integrity</p>
        </div>

        <div className="flex items-center justify-between md:justify-end space-x-3 w-full lg:w-auto">
           <div className="flex flex-col items-start md:items-end md:border-r border-gray-200 md:pr-4 md:mr-1">
              <span className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Live Feed</span>
              <span className="text-[10px] md:text-xs font-black text-green-600 flex items-center">
                 <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-bounce"></span>
                 ACTIVE
              </span>
           </div>
           <button className="flex items-center space-x-2 bg-white border border-gray-200 px-3 md:px-4 py-2 rounded-xl text-[10px] md:text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm">
              <Layers size={14} />
              <span className="hidden sm:inline">Layer Controls</span>
              <span className="sm:hidden">Layers</span>
           </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-center text-red-700">
          <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
          <p className="font-bold text-xs md:text-sm tracking-tight">{error}</p>
        </div>
      )}

      {/* Map Container - Full Height Wrapper */}
      <div className="flex-1 min-h-[400px] mb-4 relative rounded-2xl md:rounded-[2rem] overflow-hidden shadow-2xl border border-gray-100">
        {loading ? (
             <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="flex flex-col items-center">
                   <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-4 border-[#1a237e] border-t-transparent mb-4"></div>
                   <p className="text-[10px] md:text-sm font-black text-[#1a237e] tracking-widest animate-pulse">BOOTING GIS...</p>
                </div>
             </div>
        ) : (
            <PotholeMap potholes={potholes} />
        )}
        
        {/* Floating Map Legend - Hidden on very small screens, shown as minimal on medium */}
        <div className="absolute top-4 right-4 md:top-6 md:right-6 z-[1000] bg-white/95 backdrop-blur-md p-3 md:p-4 rounded-xl shadow-xl border border-gray-100 min-w-[140px] md:min-w-[180px] hidden sm:block">
           <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 md:mb-3 border-b border-gray-100 pb-2">Index</p>
           <div className="space-y-2 md:space-y-2.5">
              {[
                { label: 'Critical', color: 'bg-red-500 shadow-red-500/50' },
                { label: 'Standard', color: 'bg-orange-500 shadow-orange-500/50' },
                { label: 'Minor', color: 'bg-green-500 shadow-green-500/50' },
                { label: 'Resolved', color: 'bg-gray-600 shadow-gray-500/30' },
              ].map((item, i) => (
                <div key={i} className="flex items-center text-[10px] md:text-xs font-bold text-gray-700">
                   <div className={`w-2 h-2 md:w-3 md:h-3 ${item.color} rounded-full mr-2 md:mr-3 shadow-sm`}></div>
                   {item.label}
                </div>
              ))}
           </div>
        </div>
        
        {/* Bottom Status Info - Hidden on mobile to save space */}
        <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 z-[1000] bg-[#1a237e]/90 backdrop-blur-md text-white px-4 py-2 md:px-5 md:py-3 rounded-xl shadow-2xl hidden md:flex flex-col border border-white/10">
            <div className="flex items-center mb-1">
                <ShieldCheck size={12} className="text-orange-400 mr-2" />
                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-orange-400">System Information</span>
            </div>
            <p className="text-[10px] md:text-xs font-medium opacity-80">Encrypted AI Data Transmission Active.</p>
        </div>
      </div>
    </div>
  );
};

export default MapPage;
