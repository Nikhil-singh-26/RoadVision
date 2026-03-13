import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  FileText, 
  BarChart3, 
  Settings, 
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);

  const menuItems = [
    { title: 'Portal Home', icon: <ChevronRight size={20} />, path: '/' },
    { title: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { title: 'Map Monitoring', icon: <MapIcon size={20} />, path: '/map' },
    { title: 'Pothole Reports', icon: <FileText size={20} />, path: '/reports' },
    { title: 'Analytics', icon: <BarChart3 size={20} />, path: '/analytics' },
    { title: 'Settings', icon: <Settings size={20} />, path: '/settings' },
  ];

  return (
    <div className="w-64 h-full bg-[#1a237e] text-white flex flex-col shadow-xl">
      <div className="p-6 border-b border-white/10 flex flex-col items-center">
        <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-3">
            <span className="text-4xl">🏛️</span>
        </div>
        <h2 className="text-sm font-semibold text-center uppercase tracking-wider text-orange-400">Road Transport</h2>
        <p className="text-[10px] text-center text-white/60">Govt. of India</p>
      </div>

      <nav className="flex-1 mt-6">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.title}
              to={item.path}
              className={`flex items-center justify-between px-6 py-4 transition-all hover:bg-white/5 group ${
                isActive ? 'bg-white/10 border-r-4 border-orange-500' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className={`${isActive ? 'text-orange-400' : 'text-white/70 group-hover:text-white'}`}>
                  {item.icon}
                </span>
                <span className={`font-medium ${isActive ? 'text-white' : 'text-white/70 group-hover:text-white'}`}>
                  {item.title}
                </span>
              </div>
              {isActive && <ChevronRight size={14} className="text-orange-400" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center p-3 rounded-lg bg-orange-600/20 border border-orange-500/30 mb-4">
           <div className="w-10 h-10 rounded-full overflow-hidden bg-white/20 border-2 border-orange-500">
              <img src="/placeholder-user.png" alt="Official" className="w-full h-full object-cover" 
                onError={(e) => {e.target.src = "https://ui-avatars.com/api/?name=" + (user?.name || "Official") + "&background=ea580c&color=fff"}}
              />
           </div>
           <div className="ml-3 overflow-hidden">
             <p className="text-xs font-bold truncate">{user?.name || 'Officer'}</p>
             <p className="text-[10px] text-orange-400 capitalize">{user?.role || 'Field Officer'}</p>
           </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-md transition-all text-sm font-medium border border-white/10"
        >
          <LogOut size={16} />
          <span>Logout Portal</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
