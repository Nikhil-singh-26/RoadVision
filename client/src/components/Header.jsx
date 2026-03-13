import { Bell, Search, Info, HelpCircle, Menu } from 'lucide-react';

const Header = ({ onMenuClick }) => {
  return (
    <header className="h-16 md:h-20 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-50">
      <div className="flex items-center space-x-3 md:space-x-4">
        <button 
          onClick={onMenuClick} 
          className="lg:hidden p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu size={24} />
        </button>
        
        <div className="flex flex-col">
          <h1 className="text-sm md:text-xl font-extrabold text-[#1a237e] tracking-tight leading-tight uppercase">
             National Highway Monitoring
             <span className="hidden sm:inline"> System</span>
          </h1>
          <div className="flex items-center mt-0.5 md:mt-1">
             <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-orange-500 mr-1.5 md:mr-2 animate-pulse"></div>
             <p className="text-[8px] md:text-[10px] text-gray-500 font-bold uppercase tracking-[0.05em] md:tracking-[0.1em]">AI-Powered Portal</p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3 md:space-x-6">
        <div className="relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search detections..." 
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a237e]/20 focus:border-[#1a237e] w-48 xl:w-64 transition-all"
          />
        </div>

        <div className="flex items-center space-x-2 md:space-x-3 md:border-l md:border-gray-200 md:pl-6">
            <button className="p-1.5 md:p-2 text-gray-400 hover:text-[#1a237e] hover:bg-gray-50 rounded-lg transition-all relative">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <button className="hidden sm:block p-1.5 md:p-2 text-gray-400 hover:text-[#1a237e] hover:bg-gray-50 rounded-lg transition-all">
                <HelpCircle size={20} />
            </button>
            <div className="flex items-center ml-1 md:ml-2 bg-gray-50 border border-gray-200 px-2 md:px-3 py-1 md:py-1.5 rounded-lg">
                <img 
                  src="/emblem.jpeg" 
                  alt="Emblem of India" 
                  className="h-5 md:h-6 w-auto"
                />
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
