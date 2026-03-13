import { Bell, Search, Info, HelpCircle } from 'lucide-react';

const Header = () => {
  return (
    <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-50">
      <div className="flex items-center space-x-4">
        <div className="flex flex-col">
          <h1 className="text-xl font-extrabold text-[#1a237e] tracking-tight leading-tight">
             NATIONAL HIGHWAY POTHOLE MONITORING SYSTEM
          </h1>
          <div className="flex items-center mt-1">
             <div className="w-3 h-3 rounded-full bg-orange-500 mr-2 animate-pulse"></div>
             <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.1em]">AI-Powered Real-time Surveillance Portal</p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search NH-44 detections..." 
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a237e]/20 focus:border-[#1a237e] w-64 transition-all"
          />
        </div>

        <div className="flex items-center space-x-3 border-l border-gray-200 pl-6">
            <button className="p-2 text-gray-400 hover:text-[#1a237e] hover:bg-gray-50 rounded-lg transition-all relative">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <button className="p-2 text-gray-400 hover:text-[#1a237e] hover:bg-gray-50 rounded-lg transition-all">
                <HelpCircle size={20} />
            </button>
            <div className="flex items-center ml-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/800px-Emblem_of_India.svg.png" 
                  alt="Embem" 
                  className="h-6 w-auto mr-2"
                />
                <span className="text-[10px] font-black tracking-tighter text-[#1a237e]">सत्यमेव जयते</span>
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
