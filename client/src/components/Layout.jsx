import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-[#f8faff] text-gray-900 overflow-hidden font-sans">
      {/* Sidebar - Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[60] lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 z-[70] transition-transform duration-300 transform lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
        
        {/* Subfooter */}
        <div className="bg-white border-t border-gray-200 py-3 px-4 md:px-8 flex flex-col md:flex-row justify-between items-center text-[10px] text-gray-500 font-medium gap-2">
            <p className="text-center md:text-left">© 2026 Ministry of Road Transport and Highways. All rights reserved.</p>
            <div className="flex space-x-4">
                <span>Terms of Use</span>
                <span>Privacy Policy</span>
                <span className="text-[#1a237e] font-bold">DIGITAL INDIA INITIATIVE</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
