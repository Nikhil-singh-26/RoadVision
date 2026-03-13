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
    <div className="p-8">
      {/* Dashboard Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-gray-200">
        <div>
          <div className="flex items-center space-x-2 text-[#1a237e] mb-1">
             <Activity size={24} />
             <h1 className="text-2xl font-black uppercase tracking-tight">Main Surveillance Dashboard</h1>
          </div>
          <p className="text-sm text-gray-500 font-medium italic">Aggregate data visualization for Infrastructure Maintenance & Security</p>
        </div>
        
        <div className="flex space-x-3 mt-4 md:mt-0">
          <button className="flex items-center space-x-2 bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm">
             <Filter size={16} />
             <span>Filter Data</span>
          </button>
          <button className="flex items-center space-x-2 bg-[#1a237e] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#283593] transition-all shadow-lg shadow-blue-900/10">
             <Download size={16} />
             <span>Export Reports</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-center text-red-700">
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          <p className="font-bold text-sm tracking-tight">{error}</p>
        </div>
      )}

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Total Reported', value: stats.total, icon: <MapPin />, color: 'blue', desc: 'Total tracked incidents' },
          { label: 'Critical Damage', value: stats.high, icon: <AlertTriangle />, color: 'red', desc: 'Immediate attention req.' },
          { label: 'Pending Repairs', value: stats.pending, icon: <Clock3 />, color: 'orange', desc: 'Active repair tickets' },
          { label: 'Resolved Tickets', value: stats.fixed, icon: <CheckCircle2 />, color: 'green', desc: 'Successfully restored' },
        ].map((card, i) => (
          <div key={i} className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-6 relative overflow-hidden group hover:shadow-md transition-all border-b-4 border-b-${card.color}-500`}>
             <div className={`p-3 rounded-xl bg-${card.color}-50 text-${card.color}-600 inline-block mb-4 group-hover:scale-110 transition-transform`}>
                {card.icon}
             </div>
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{card.label}</p>
             <h3 className="text-4xl font-black text-gray-900 mb-2">{card.value}</h3>
             <p className="text-xs text-gray-500 font-medium">{card.desc}</p>
             
             {/* Decorative background element */}
             <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-${card.color}-50 rounded-full opacity-30 group-hover:scale-150 transition-transform`}></div>
          </div>
        ))}
      </div>

      {/* Recent Detections Table Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden mb-8">
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-[#1a237e]/[0.02]">
          <div className="flex items-center space-x-3">
             <div className="w-2 h-8 bg-[#1a237e] rounded-full"></div>
             <h3 className="text-xl font-black text-[#1a237e] uppercase tracking-tight">Recent Surveillance Detections</h3>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search GPS coordinates..." className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1a237e]/20 focus:border-[#1a237e] w-80 bg-white" />
          </div>
        </div>
        
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Image Reference</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Precise Location</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Severity Index</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">AI Confidence</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Resolution Status</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {potholes.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-8 py-16 text-center">
                     <div className="flex flex-col items-center opacity-40">
                        <Activity size={48} className="mb-4 text-gray-300" />
                        <p className="text-lg font-bold text-gray-400 italic font-serif">No structural damages detected on any national highway currently.</p>
                     </div>
                  </td>
                </tr>
              ) : (
                potholes.map(pothole => (
                  <tr key={pothole._id} className="hover:bg-gray-50/80 transition-all border-l-4 border-l-transparent hover:border-l-[#1a237e]">
                    <td className="px-8 py-4 text-center">
                      {pothole.imageUrl ? (
                        <div className="relative group w-20 h-14 mx-auto cursor-pointer">
                           <img src={pothole.imageUrl} alt="Pothole" className="w-full h-full rounded-lg object-cover border-2 border-white shadow-sm group-hover:shadow-md transition-all" />
                           <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Eye size={16} className="text-white" />
                           </div>
                        </div>
                      ) : (
                        <div className="w-20 h-14 bg-gray-100 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-[8px] font-black text-gray-300 uppercase tracking-tighter mx-auto">NO_SURVEILLANCE_IMAGE</div>
                      )}
                    </td>
                    <td className="px-8 py-4">
                       <div className="flex flex-col">
                          <span className="text-xs font-black text-gray-900 font-mono tracking-tighter">{pothole.latitude.toFixed(6)}, {pothole.longitude.toFixed(6)}</span>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mt-1 truncate max-w-[150px]">Detected @ NH-Series India</span>
                       </div>
                    </td>
                    <td className="px-8 py-4 text-center">
                      <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
                        ${pothole.severityLevel === 'high' ? 'bg-red-100 text-red-700 border border-red-200 shadow-sm shadow-red-500/10' : 
                          pothole.severityLevel === 'medium' ? 'bg-orange-100 text-orange-700 border border-orange-200 shadow-sm shadow-orange-500/10' : 
                          'bg-green-100 text-green-700 border border-green-200 shadow-sm shadow-green-500/10'}`}>
                        {pothole.severityLevel}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-black text-gray-900">{(pothole.detectionConfidence * 100).toFixed(1)}%</span>
                        <div className="w-20 h-1 bg-gray-200 rounded-full mt-2 overflow-hidden">
                           <div className={`h-full ${pothole.detectionConfidence > 0.85 ? 'bg-green-500' : 'bg-orange-500'}`} style={{ width: `${pothole.detectionConfidence * 100}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                       <div className="flex items-center">
                          <span className={`w-2 h-2 rounded-full mr-2 ${pothole.status === 'fixed' ? 'bg-green-500' : 'bg-orange-500 animate-pulse'}`}></span>
                          <span className={`text-[10px] font-black uppercase tracking-widest ${pothole.status === 'fixed' ? 'text-green-700' : 'text-orange-700'}`}>
                            {pothole.status.replace('_', ' ')}
                          </span>
                       </div>
                       <p className="text-[10px] text-gray-400 font-medium mt-1 uppercase italic">Reported: {new Date(pothole.detectedAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-8 py-4 text-right">
                       <div className="flex items-center justify-end space-x-2">
                          <select 
                            value={pothole.status}
                            onChange={(e) => handleStatusUpdate(pothole._id, e.target.value)}
                            className="text-[10px] font-black uppercase tracking-tight border border-gray-200 rounded-lg px-3 py-2 bg-white hover:border-[#1a237e] transition-colors focus:outline-none focus:ring-4 focus:ring-[#1a237e]/10"
                          >
                            <option value="reported">Update: Reported</option>
                            <option value="under_repair">Update: Repair Active</option>
                            <option value="fixed">Update: Resolved</option>
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
        
        <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
           <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Showing {potholes.length} active structural maintenance records</p>
           <div className="flex space-x-2">
              <button disabled className="px-4 py-2 bg-white border border-gray-200 text-[10px] font-black text-gray-300 rounded-lg uppercase tracking-tight">Previous</button>
              <button disabled className="px-4 py-2 bg-white border border-gray-200 text-[10px] font-black text-gray-700 rounded-lg uppercase tracking-tight">Next Page</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
