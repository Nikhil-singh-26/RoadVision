import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  BrainCircuit, 
  MapPin, 
  ClipboardList, 
  Activity, 
  Flame, 
  LayoutDashboard 
} from 'lucide-react';

const WelcomePage = () => {
  const navigate = useNavigate();

  const features = [
    { title: 'AI Pothole Detection', icon: <BrainCircuit className="text-blue-600" size={32} /> },
    { title: 'Geo Tagged Monitoring', icon: <MapPin className="text-orange-600" size={32} /> },
    { title: 'Automated Complaint Filing', icon: <ClipboardList className="text-green-600" size={32} /> },
    { title: 'Repair Status Tracking', icon: <Activity className="text-purple-600" size={32} /> },
    { title: 'Highway Risk Heatmap', icon: <Flame className="text-red-600" size={32} /> },
    { title: 'Real Time Monitoring Dashboard', icon: <LayoutDashboard className="text-indigo-600" size={32} /> },
  ];

  const cardVariants = {
    offscreen: {
      y: 50,
      opacity: 0,
      scale: 0.9,
    },
    onscreen: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        bounce: 0.4,
        duration: 0.8,
      },
    },
  };

  return (
    <div className="h-screen w-full bg-white font-sans overflow-y-auto overflow-x-hidden flex flex-col">
      {/* Redesigned Header Section */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="w-full px-4 md:px-8 py-4 flex items-center justify-between">
          {/* Left: Emblem */}
          <div className="flex items-center space-x-4">
            <img 
              src="/emblem.jpeg" 
              alt="Emblem of India" 
              className="h-16 md:h-20 w-auto"
            />
            <div className="hidden lg:flex flex-col">
              <p className="text-xs font-bold text-[#ea580c] tracking-widest uppercase">Government of India</p>
              <p className="text-[10px] text-gray-400 font-medium">Ministry of Road Transport & Highways</p>
            </div>
          </div>

          {/* Center: Title */}
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-lg md:text-2xl lg:text-3xl font-black text-[#1a237e] uppercase tracking-tighter leading-tight">
              National Highway AI Pothole Monitoring System
            </h1>
          </div>

          {/* Right: PM Image (Fixed/Header included) */}
          <div className="flex items-center space-x-3 md:space-x-4">
            <div className="hidden sm:flex flex-col text-right">
              <p className="text-xs md:text-sm font-black text-[#1a237e] leading-tight">Shri Narendra Modi</p>
              <p className="text-[10px] md:text-xs font-bold text-[#ea580c] uppercase tracking-tighter">Prime Minister of India</p>
            </div>
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-[#1a237e]/10 shadow-lg">
              <img 
                src="/pm.jpg" 
                alt="Shri Narendra Modi" 
                className="w-full h-full object-cover grayscale md:grayscale-0 transition-all"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 w-full flex flex-col items-center bg-[#f8faff]">
        <div className="w-full max-w-7xl px-4 md:px-8 py-8 md:py-12">
          {/* Main Content Area */}
          <div className="w-full">
            {/* Ministry Banner */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="w-full rounded-[2rem] overflow-hidden shadow-2xl mb-12 border border-white"
            >
              <img 
                src="/ministry.png" 
                alt="Ministry of Road Transport and Highways" 
                className="w-full h-[200px] md:h-[400px] object-cover"
              />
            </motion.div>

            {/* Welcome Message & Action */}
            <div className="max-w-4xl mx-auto text-center mb-16 px-4">
              <h2 className="text-3xl md:text-5xl font-black text-[#1a237e] mb-6 leading-tight">
                Empowering India's Infrastructure through AI
              </h2>
              <div className="w-24 h-2 bg-[#ea580c] mx-auto mb-8 rounded-full"></div>
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed font-medium italic mb-10">
                "Our vision is to create a zero-pothole national highway network using cutting-edge artificial intelligence and real-time monitoring technologies."
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="w-full sm:w-auto px-10 py-5 bg-[#1a237e] text-white rounded-2xl font-black text-lg uppercase tracking-widest hover:bg-[#283593] shadow-2xl shadow-blue-900/40 transition-all hover:scale-105 active:scale-95 flex items-center justify-center"
                >
                  Enter Monitoring Dashboard
                  <span className="ml-3 font-serif">➔</span>
                </button>
                <button 
                  onClick={() => navigate('/login')}
                  className="w-full sm:w-auto px-10 py-5 bg-white text-[#1a237e] border-2 border-[#1a237e] rounded-2xl font-black text-lg uppercase tracking-widest hover:bg-[#f8faff] transition-all flex items-center justify-center"
                >
                  Officer Login
                </button>
              </div>
            </div>

            {/* Features Section */}
            <div className="mb-20">
              <div className="flex items-center justify-between mb-10 border-b border-gray-200 pb-4">
                <h3 className="text-xs md:text-sm font-black text-[#1a237e] uppercase tracking-[0.3em]">Core Portal Capabilities</h3>
                <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full uppercase">Digital India Framework</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all cursor-default group"
                    initial="offscreen"
                    whileInView="onscreen"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={cardVariants}
                  >
                    <div className="w-16 h-16 bg-[#f0f2ff] rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#1a237e] transition-all duration-500 group-hover:rotate-6">
                      {React.cloneElement(feature.icon, { className: 'text-[#1a237e] group-hover:text-white transition-colors' })}
                    </div>
                    <h4 className="text-lg font-black text-[#1a237e] uppercase tracking-tight group-hover:text-[#ea580c] transition-colors">{feature.title}</h4>
                    <p className="text-sm text-gray-500 mt-3 font-medium leading-relaxed">Secured infrastructure monitoring utilizing deep learning algorithms and geospatial analytics.</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Portal Footer */}
      <footer className="bg-white py-12 border-t border-gray-100 w-full">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 mb-8 items-center opacity-60">
             <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Digital_India_logo.svg/1200px-Digital_India_logo.svg.png" className="h-10 grayscale hover:grayscale-0 transition-all cursor-pointer" alt="Digital India" />
             <img src="https://upload.wikimedia.org/wikipedia/en/thumb/9/9d/Make_in_India_Logo.svg/1200px-Make_in_India_Logo.svg.png" className="h-10 grayscale hover:grayscale-0 transition-all cursor-pointer" alt="Make in India" />
             <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/NHAI_logo.png/1200px-NHAI_logo.png" className="h-12 grayscale hover:grayscale-0 transition-all cursor-pointer" alt="NHAI" />
          </div>
          <div className="w-16 h-1 bg-[#ea580c] mx-auto mb-6 rounded-full"></div>
          <p className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-[0.2em] max-w-2xl mx-auto leading-loose">
            Official Portal of National Highways Authority of India (NHAI) <br/>
            &copy; 2026 Ministry of Road Transport & Highways, Government of India. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default WelcomePage;
