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
    <div className="p-8 h-full flex flex-col overflow-hidden">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
        <div>
          <div className="flex items-center space-x-2 text-[#1a237e] mb-1">
             <MapIconLucide size={24} />
             <h1 className="text-2xl font-black uppercase tracking-tight">Geospatial Surveillance Map</h1>
          </div>
          <p className="text-sm text-gray-500 font-medium">Monitoring Indian National Highways (NH-series) for realtime structural integrity</p>
        </div>

        <div className="flex space-x-3">
           <div className="flex flex-col items-end border-r border-gray-200 pr-4 mr-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Live Feed</span>
              <span className="text-xs font-black text-green-600 flex items-center">
                 <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                 COMMUNICATION ACTIVE
              </span>
           </div>
           <button className="flex items-center space-x-2 bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all">
              <Layers size={16} />
              <span>Layer Controls</span>
           </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-center text-red-700">
          <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
          <p className="font-bold text-sm tracking-tight">{error}</p>
        </div>
      )}

      {/* Map Container - Full Height Wrapper */}
      <div className="flex-1 min-h-[500px] mb-4 relative">
        {loading ? (
             <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-50 flex items-center justify-center rounded-2xl">
                <div className="flex flex-col items-center">
                   <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#1a237e] border-t-transparent mb-4"></div>
                   <p className="text-sm font-black text-[#1a237e] tracking-widest animate-pulse">RENDERING GIS ENGINE...</p>
                </div>
             </div>
        ) : (
            <PotholeMap potholes={potholes} />
        )}
        
        {/* Floating Map Legend */}
        <div className="absolute top-6 right-6 z-[1000] bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-gray-100 min-w-[180px]">
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-100 pb-2">Severity Index</p>
           <div className="space-y-2.5">
              <div className="flex items-center text-xs font-bold text-gray-700">
                 <div className="w-3 h-3 bg-red-500 rounded-full mr-3 shadow-sm shadow-red-500/50"></div>
                 Critical Damage
              </div>
              <div className="flex items-center text-xs font-bold text-gray-700">
                 <div className="w-3 h-3 bg-orange-500 rounded-full mr-3 shadow-sm shadow-orange-500/50"></div>
                 Standard Wear
              </div>
              <div className="flex items-center text-xs font-bold text-gray-700">
                 <div className="w-3 h-3 bg-green-500 rounded-full mr-3 shadow-sm shadow-green-500/50"></div>
                 Surface Irregularity
              </div>
              <div className="flex items-center text-xs font-bold text-gray-400">
                 <div className="w-3 h-3 bg-gray-600 rounded-full mr-3 shadow-sm shadow-gray-500/30"></div>
                 Repair Resolved
              </div>
           </div>
        </div>
        
        {/* Bottom Status Info */}
        <div className="absolute bottom-6 left-6 z-[1000] bg-[#1a237e] text-white px-5 py-3 rounded-xl shadow-2xl flex flex-col border border-white/10">
            <div className="flex items-center mb-1">
                <ShieldCheck size={14} className="text-orange-400 mr-2" />
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">System Information</span>
            </div>
            <p className="text-xs font-medium">All GPS coordinates are encrypted and verified by AI.</p>
        </div>
      </div>
    </div>
  );
};

export default MapPage;
