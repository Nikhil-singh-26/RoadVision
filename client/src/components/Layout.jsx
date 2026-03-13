import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen w-full bg-[#f8faff] text-gray-900 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Header />
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
        
        {/* Subfooter */}
        <div className="bg-white border-t border-gray-200 py-3 px-8 flex justify-between items-center text-[10px] text-gray-500 font-medium">
            <p>© 2026 Ministry of Road Transport and Highways. All rights reserved.</p>
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
