import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Map, 
  FileText, 
  BarChart3, 
  Settings,
  LogOut,
  ChevronRight,
  X,
  Home
} from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const Sidebar = ({ onClose }) => {
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);
  const { t } = useLanguage();

  const menuItems = [
    { title: t('nav.home'), icon: <Home size={20} />, path: '/' },
    { title: t('nav.dashboard'), icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { title: t('nav.map'), icon: <Map size={20} />, path: '/map' },
    { title: t('nav.report'), icon: <FileText size={20} />, path: '/report' },
    { title: t('nav.analytics'), icon: <BarChart3 size={20} />, path: '/analytics' },
    { title: t('nav.settings'), icon: <Settings size={20} />, path: '/settings' },
  ];

  return (
    <div className="w-64 md:w-72 h-full bg-[#1a237e] text-white flex flex-col shadow-xl border-r border-white/5">
      <div className="p-6 border-b border-white/10 flex flex-col items-center relative">
        <button 
          onClick={onClose}
          className="lg:hidden absolute top-4 right-4 p-1 hover:bg-white/10 rounded-full transition-colors"
        >
          <X size={20} />
        </button>
        
        <div className="w-20 h-20 md:w-24 md:h-24 bg-[#1a237e] rounded-full flex items-center justify-center mb-3 shadow-2xl border-4 border-white/20 p-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-white rounded-full"></div>
            <img src="/NHAI.jpeg" className="w-[85%] h-[85%] object-contain relative z-10" alt="NHAI Logo" />
        </div>
        <h2 className="text-xs md:text-sm font-semibold text-center uppercase tracking-wider text-orange-400">{t('common.officer')} {t('common.portal')}</h2>
        <p className="text-[10px] text-center text-white/60">{t('welcome.gov_india')}</p>
      </div>

      <nav className="flex-1 mt-4 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 1024 && onClose) onClose();
              }}
              className={`flex items-center justify-between px-6 py-3.5 transition-all hover:bg-white/5 group ${
                isActive ? 'bg-white/10 border-r-4 border-orange-500' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className={`${isActive ? 'text-orange-400' : 'text-white/70 group-hover:text-white'}`}>
                  {item.icon}
                </span>
                <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-white/70 group-hover:text-white'}`}>
                  {item.title}
                </span>
              </div>
              {isActive && <ChevronRight size={14} className="text-orange-400" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10 bg-black/10">
        <div className="flex items-center p-3 rounded-xl bg-white/5 border border-white/10 mb-4">
           <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-orange-500 flex-shrink-0">
              <img src="/placeholder-user.png" alt="Official" className="w-full h-full object-cover" 
                onError={(e) => {e.target.src = "https://ui-avatars.com/api/?name=" + (user?.name || "Official") + "&background=ea580c&color=fff"}}
              />
           </div>
           <div className="ml-3 overflow-hidden">
             <p className="text-xs font-bold truncate leading-none mb-1">{user?.name || t('common.officer')}</p>
             <p className="text-[10px] text-orange-400 capitalize opacity-80">{user?.role === 'admin' ? t('common.admin') : t('common.officer')}</p>
           </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-xl transition-all text-xs font-bold border border-red-500/20"
        >
          <LogOut size={16} />
          <span>{t('common.logout')}</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
