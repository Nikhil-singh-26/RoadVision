import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle2, 
  Clock3, 
  MapPin, 
  Search, 
  Download, 
  Filter,
  Eye,
  MoreVertical,
  Activity
} from 'lucide-react';

const Dashboard = () => {
  const [potholes, setPotholes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchPotholes();
  }, []);

  const fetchPotholes = async () => {
    try {
      const { data } = await api.get('/potholes');
      setPotholes(data);
    } catch (err) {
      setError('Communication failure with central database.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await api.patch(`/potholes/${id}/status`, { status: newStatus });
      fetchPotholes();
    } catch (err) {
      setError('Failed to update resolution status.');
    }
  };

  const stats = {
    total: potholes.length,
    high: potholes.filter(p => p.severityLevel === 'high' && p.status !== 'fixed').length,
    pending: potholes.filter(p => p.status === 'reported' || p.status === 'under_repair').length,
    fixed: potholes.filter(p => p.status === 'fixed').length,
  };

  if (loading) return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-[#f8faff] p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#1a237e] border-t-transparent mb-4"></div>
        <p className="text-sm font-black text-[#1a237e] tracking-widest">LOADING ANALYTICS CORE...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-8">
      {/* Dashboard Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 md:mb-8 pb-4 md:pb-6 border-b border-gray-200 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[#1a237e] mb-1">
             <Activity size={20} className="md:w-6 md:h-6" />
             <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight">Surveillance Dashboard</h1>
          </div>
          <p className="text-[10px] md:text-sm text-gray-500 font-medium italic">Aggregate data visualization for Maintenance & Security</p>
        </div>
        
        <div className="flex space-x-2 md:space-x-3">
          <button className="flex-1 md:flex-none flex items-center justify-center space-x-2 bg-white border border-gray-200 px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm">
             <Filter size={14} className="md:w-4 md:h-4" />
             <span>Filter</span>
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center space-x-2 bg-[#1a237e] text-white px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-bold hover:bg-[#283593] transition-all shadow-lg shadow-blue-900/10">
             <Download size={14} className="md:w-4 md:h-4" />
             <span>Export</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-center text-red-700">
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          <p className="font-bold text-xs md:text-sm tracking-tight">{error}</p>
        </div>
      )}

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-10">
        {[
          { label: 'Total Reported', value: stats.total, icon: <MapPin />, color: 'blue', desc: 'Total tracked incidents' },
          { label: 'Critical Damage', value: stats.high, icon: <AlertTriangle />, color: 'red', desc: 'Immediate attention' },
          { label: 'Pending Repairs', value: stats.pending, icon: <Clock3 />, color: 'orange', desc: 'Active tickets' },
          { label: 'Resolved Tickets', value: stats.fixed, icon: <CheckCircle2 />, color: 'green', desc: 'Successfully restored' },
        ].map((card, i) => (
          <div key={i} className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6 relative overflow-hidden group hover:shadow-md transition-all border-b-4 border-b-${card.color}-500`}>
             <div className={`p-2.5 md:p-3 rounded-xl bg-${card.color}-50 text-${card.color}-600 inline-block mb-3 md:mb-4 group-hover:scale-110 transition-transform`}>
                {card.icon}
             </div>
             <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{card.label}</p>
             <h3 className="text-3xl md:text-4xl font-black text-gray-900 mb-1 md:mb-2">{card.value}</h3>
             <p className="text-[10px] md:text-xs text-gray-500 font-medium">{card.desc}</p>
             
             {/* Decorative background element */}
             <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-${card.color}-50 rounded-full opacity-30 group-hover:scale-150 transition-transform`}></div>
          </div>
        ))}
      </div>

      {/* Recent Detections Table Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden mb-8">
        <div className="px-4 md:px-8 py-4 md:py-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#1a237e]/[0.02] gap-4">
          <div className="flex items-center space-x-3">
             <div className="hidden sm:block w-2 h-8 bg-[#1a237e] rounded-full"></div>
             <h3 className="text-lg md:text-xl font-black text-[#1a237e] uppercase tracking-tight">Surveillance Detections</h3>
          </div>
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search coordinates..." className="w-full sm:w-64 lg:w-80 pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1a237e]/20 focus:border-[#1a237e] bg-white" />
          </div>
        </div>
        
        <div className="overflow-x-auto w-full scrollbar-hide">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 md:px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Reference</th>
                <th className="px-6 md:px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Location</th>
                <th className="px-6 md:px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Severity</th>
                <th className="px-6 md:px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Confidence</th>
                <th className="px-6 md:px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Status</th>
                <th className="px-6 md:px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {potholes.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-8 py-16 text-center">
                     <div className="flex flex-col items-center opacity-40">
                        <Activity size={48} className="mb-4 text-gray-300" />
                        <p className="text-lg font-bold text-gray-400 italic">No structural damages detected.</p>
                     </div>
                  </td>
                </tr>
              ) : (
                potholes.map(pothole => (
                  <tr key={pothole._id} className="hover:bg-gray-50/80 transition-all border-l-4 border-l-transparent hover:border-l-[#1a237e]">
                    <td className="px-6 md:px-8 py-4">
                      {pothole.imageUrl ? (
                        <div className="relative group w-16 h-12 md:w-20 md:h-14 mx-auto cursor-pointer">
                           <img src={pothole.imageUrl} alt="Pothole" className="w-full h-full rounded-lg object-cover border-2 border-white shadow-sm" />
                           <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Eye size={16} className="text-white" />
                           </div>
                        </div>
                      ) : (
                        <div className="w-16 h-12 md:w-20 md:h-14 bg-gray-100 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-[8px] font-black text-gray-300 uppercase mx-auto">NO_IMG</div>
                      )}
                    </td>
                    <td className="px-6 md:px-8 py-4">
                       <div className="flex flex-col">
                          <span className="text-[11px] md:text-xs font-black text-gray-900 font-mono tracking-tighter">{pothole.latitude.toFixed(4)}, {pothole.longitude.toFixed(4)}</span>
                          <span className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-tight mt-1">NH-Series India</span>
                       </div>
                    </td>
                    <td className="px-6 md:px-8 py-4 text-center">
                      <span className={`inline-flex px-2 md:px-3 py-1 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest
                        ${pothole.severityLevel === 'high' ? 'bg-red-100 text-red-700' : 
                          pothole.severityLevel === 'medium' ? 'bg-orange-100 text-orange-700' : 
                          'bg-green-100 text-green-700'}`}>
                        {pothole.severityLevel}
                      </span>
                    </td>
                    <td className="px-6 md:px-8 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-xs md:text-sm font-black text-gray-900">{(pothole.detectionConfidence * 100).toFixed(1)}%</span>
                        <div className="w-12 md:w-20 h-1 bg-gray-200 rounded-full mt-2 overflow-hidden">
                           <div className={`h-full ${pothole.detectionConfidence > 0.85 ? 'bg-green-500' : 'bg-orange-500'}`} style={{ width: `${pothole.detectionConfidence * 100}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 md:px-8 py-4 text-[10px] font-black uppercase">
                       <div className="flex items-center">
                          <span className={`w-2 h-2 rounded-full mr-2 ${pothole.status === 'fixed' ? 'bg-green-500' : 'bg-orange-500 animate-pulse'}`}></span>
                          <span className={pothole.status === 'fixed' ? 'text-green-700' : 'text-orange-700'}>
                            {pothole.status.replace('_', ' ')}
                          </span>
                       </div>
                    </td>
                    <td className="px-6 md:px-8 py-4 text-right">
                       <div className="flex items-center justify-end space-x-2">
                          <select 
                            value={pothole.status}
                            onChange={(e) => handleStatusUpdate(pothole._id, e.target.value)}
                            className="text-[9px] md:text-[10px] font-black uppercase tracking-tight border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:ring-4 focus:ring-[#1a237e]/10 outline-none"
                          >
                            <option value="reported">Reported</option>
                            <option value="under_repair">Repairing</option>
                            <option value="fixed">Fixed</option>
                          </select>
                          <button className="p-2 text-gray-400 hover:text-[#1a237e] hover:bg-gray-100 rounded-lg transition-all">
                             <MoreVertical size={16} />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="px-4 md:px-8 py-4 md:py-6 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
           <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest text-center sm:text-left">Showing {potholes.length} active records</p>
           <div className="flex space-x-2 w-full sm:w-auto">
              <button disabled className="flex-1 sm:flex-none px-4 py-2 bg-white border border-gray-200 text-[10px] font-black text-gray-300 rounded-lg uppercase tracking-tight">Prev</button>
              <button disabled className="flex-1 sm:flex-none px-4 py-2 bg-white border border-gray-200 text-[10px] font-black text-gray-700 rounded-lg uppercase tracking-tight">Next</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
