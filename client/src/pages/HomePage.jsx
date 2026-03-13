import { 
  ShieldCheck, 
  Map as MapIcon, 
  BrainCircuit, 
  Activity,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="p-8">
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden mb-12 bg-[#1a237e] text-white shadow-2xl min-h-[400px] flex items-center">
        <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px]"></div>
        </div>
        
        <div className="relative z-10 px-12 py-16 max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-orange-500/20 border border-orange-500/30 px-3 py-1 rounded-full mb-6 text-orange-400 text-xs font-bold uppercase tracking-widest">
            <ShieldCheck size={14} />
            <span>Official Surveillance Portal</span>
          </div>
          <h1 className="text-5xl font-extrabold mb-6 leading-tight">
            AI Powered Road Damage Monitoring & <span className="text-orange-500">Grievance System</span>
          </h1>
          <p className="text-lg text-white/70 mb-8 font-medium">
            Advancing National Highway safety through real-time YOLOv8 computer vision detection, 
            automated reporting, and streamlined maintenance workflows for a better India.
          </p>
          <div className="flex space-x-4">
            <Link to="/map" className="px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold flex items-center transition-all shadow-lg shadow-orange-950/20">
               Live Surveillance Map <ArrowRight size={18} className="ml-2" />
            </Link>
            <Link to="/dashboard" className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold border border-white/10 transition-all backdrop-blur-sm">
               View Statistics
            </Link>
          </div>
        </div>
        
        <div className="absolute right-[-10%] top-[-10%] w-[60%] h-[120%] hidden lg:block opacity-40">
            <div className="w-full h-full bg-[conic-gradient(from_0deg,#1a237e,#ea580c,#1a237e)] rounded-full blur-[100px] animate-pulse"></div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 text-center">
        {[
          { title: 'AI Detection', desc: 'Real-time vehicle mounted YOLOv8 sensors capturing street data.', icon: <BrainCircuit size={32} className="text-orange-500" /> },
          { title: 'Geo Mapping', desc: 'Precise GIS-based location tracking of all reported road damages.', icon: <MapIcon size={32} className="text-blue-500" /> },
          { title: 'Auto Complaint', desc: 'Seamlessly generated maintenance tickets with visual evidence.', icon: < ShieldCheck size={32} className="text-green-500" /> },
          { title: 'Live Monitoring', desc: 'End-to-end repair progress tracking for NHAI officials.', icon: <Activity size={32} className="text-purple-500" /> },
        ].map((item, i) => (
          <div key={i} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-gray-100 transition-colors">
              {item.icon}
            </div>
            <h3 className="text-lg font-bold text-[#1a237e] mb-3">{item.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Placeholder Banner for Ministry */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm flex flex-col md:flex-row items-center border-l-8 border-l-[#1a237e]">
         <div className="p-12 flex-1">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/National_Highways_Authority_of_India_logo.svg/1200px-National_Highways_Authority_of_India_logo.svg.png" 
              alt="NHAI" 
              className="h-16 w-auto mb-6"
            />
            <h2 className="text-3xl font-black text-[#1a237e] mb-4">TRANSFORMING NATION'S INFRASTRUCTURE</h2>
            <p className="text-gray-600 font-medium max-w-xl">
               Under the visionary leadership, the Ministry of Road Transport and Highways is committed to 
               building safer roads through digital innovation and modern technology integration.
            </p>
         </div>
         <div className="w-full md:w-1/3 bg-gray-100 h-64 md:h-full relative overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1545143333-5733de89f9d2?auto=format&fit=crop&q=80&w=2000" 
              alt="Road" 
              className="w-full h-full object-cover grayscale opacity-50"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1a237e]/20 to-transparent"></div>
         </div>
      </div>
    </div>
  );
};

export default HomePage;
