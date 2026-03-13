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
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      {/* Header Section */}
      <header className="bg-white py-6 border-b border-gray-100">
        <div className="container mx-auto px-4 flex flex-col items-center">
          <p className="text-[10px] font-bold text-gray-500 tracking-[0.4em] uppercase mb-2">SATYAMEV JAYATE</p>
          <img 
            src="/emblem.jpeg" 
            alt="Emblem of India" 
            className="h-20 w-auto mb-4"
          />
          <h1 className="text-2xl md:text-3xl font-black text-[#1a237e] text-center uppercase tracking-tight leading-tight">
            National Highway AI Pothole Monitoring System
          </h1>
          <p className="text-xs font-bold text-[#ea580c] mt-1 tracking-widest uppercase">Government of India</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 relative">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Main Content Area */}
          <div className="flex-1">
            {/* Ministry Banner */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="w-full rounded-2xl overflow-hidden shadow-2xl mb-12 border border-gray-100"
            >
              <img 
                src="/ministry.png" 
                alt="Ministry of Road Transport and Highways" 
                className="w-full h-auto object-cover"
              />
            </motion.div>

            {/* Welcome Message */}
            <div className="max-w-4xl mb-16">
              <h2 className="text-4xl font-black text-[#1a237e] mb-6 leading-tight">
                Welcome to the National Highway AI Monitoring Portal
              </h2>
              <div className="w-20 h-2 bg-[#ea580c] mb-6 rounded-full"></div>
              <p className="text-lg text-gray-600 leading-relaxed font-medium italic border-l-4 border-gray-100 pl-6">
                "This platform uses Artificial Intelligence, geospatial mapping and automated monitoring systems to detect potholes, track road damage and support rapid maintenance of India's national highways."
              </p>
              
              <button 
                onClick={() => navigate('/dashboard')}
                className="mt-10 px-10 py-5 bg-[#1a237e] text-white rounded-2xl font-black text-lg uppercase tracking-widest hover:bg-[#283593] shadow-2xl shadow-blue-900/40 transition-all hover:scale-105 active:scale-95 flex items-center"
              >
                Enter Monitoring Dashboard
                <span className="ml-3">➔</span>
              </button>
            </div>

            {/* Features Section */}
            <div className="mb-20">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-10 border-b border-gray-100 pb-4">Core Portal Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all cursor-default group"
                    initial="offscreen"
                    whileInView="onscreen"
                    viewport={{ once: true, amount: 0.8 }}
                    variants={cardVariants}
                  >
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-white transition-colors border border-transparent group-hover:border-gray-100">
                      {feature.icon}
                    </div>
                    <h4 className="text-lg font-black text-[#1a237e] uppercase tracking-tight">{feature.title}</h4>
                    <p className="text-xs text-gray-500 mt-2 font-medium">Official highway monitoring infrastructure under NHAI digital framework.</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Prime Minister Image (Fixed style in the flow but visually distinct) */}
          <div className="md:w-80 flex-shrink-0">
            <motion.div 
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="sticky top-28 bg-white p-4 rounded-[2rem] shadow-2xl border border-gray-50 text-center"
            >
              <div className="rounded-[1.5rem] overflow-hidden mb-4 shadow-inner">
                <img 
                  src="/pm.jpg" 
                  alt="Shri Narendra Modi" 
                  className="w-full h-auto grayscale hover:grayscale-0 transition-all duration-700"
                />
              </div>
              <p className="text-lg font-black text-[#1a237e] leading-tight mb-1">Shri Narendra Modi</p>
              <p className="text-xs font-bold text-[#ea580c] uppercase tracking-wider">Prime Minister of India</p>
              
              <div className="mt-4 pt-4 border-t border-gray-50">
                 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter italic">"A vision for robust national infrastructure."</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Portal Footer */}
      <footer className="bg-gray-50 py-10 mt-12 border-t border-gray-200 text-center">
        <div className="flex justify-center space-x-8 mb-4">
           <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Digital_India_logo.svg/1200px-Digital_India_logo.svg.png" className="h-8 grayscale opacity-50 hover:grayscale-0 transition-all" alt="Digital India" />
           <img src="https://upload.wikimedia.org/wikipedia/en/thumb/9/9d/Make_in_India_Logo.svg/1200px-Make_in_India_Logo.svg.png" className="h-8 grayscale opacity-50 hover:grayscale-0 transition-all" alt="Make in India" />
        </div>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          Integrated Portal of Ministry of Road Transport & Highways, Govt. of India
        </p>
      </footer>
    </div>
  );
};

export default WelcomePage;
