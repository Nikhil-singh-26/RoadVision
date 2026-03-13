import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  Settings, 
  Moon, 
  Sun, 
  MapPin, 
  Bell, 
  User, 
  Lock, 
  Globe, 
  Shield, 
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const SettingsPage = () => {
  const { t, language, setLanguage } = useLanguage();
  
  const [gpsEnabled, setGpsEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const Toggle = ({ enabled, setEnabled, icon: Icon }) => (
    <button 
      onClick={() => setEnabled(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
        enabled ? 'bg-[#ea580c]' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        } flex items-center justify-center`}
      >
        {Icon && <Icon size={10} className={enabled ? 'text-[#ea580c]' : 'text-gray-400'} />}
      </span>
    </button>
  );

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100">
          <Settings className="text-[#1a237e]" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-[#1a237e] uppercase tracking-tight">{t('settings.title')}</h1>
          <p className="text-sm text-gray-500 font-medium">{t('settings.desc')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
        {/* Appearance Section */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
              <Globe size={20} />
            </div>
            <h2 className="text-lg font-black text-gray-800 uppercase tracking-tighter">{t('settings.language')}</h2>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-700">{t('settings.language')}</p>
                <p className="text-xs text-gray-500">{t('settings.language_desc')}</p>
              </div>
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl text-xs font-bold text-[#1a237e] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="en">English (En)</option>
                <option value="hi">Hindi (हिन्दी)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Privacy & GPS Section */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-orange-50 rounded-xl text-orange-600">
              <MapPin size={20} />
            </div>
            <h2 className="text-lg font-black text-gray-800 uppercase tracking-tighter">{t('settings.privacy')}</h2>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-700">{t('settings.gps')}</p>
                <p className="text-xs text-gray-500">{t('settings.gps_desc')}</p>
              </div>
              <Toggle enabled={gpsEnabled} setEnabled={setGpsEnabled} icon={MapPin} />
            </div>

            <div className="flex items-center space-x-2 p-3 bg-amber-50 rounded-2xl border border-amber-100">
              <AlertCircle className="text-amber-600" size={16} />
              <p className="text-[10px] text-amber-700 font-bold leading-tight">
                {t('settings.gps_warning')}
              </p>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-purple-50 rounded-xl text-purple-600">
              <Bell size={20} />
            </div>
            <h2 className="text-lg font-black text-gray-800 uppercase tracking-tighter">{t('settings.intelligence')}</h2>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-700">{t('settings.notifications')}</p>
                <p className="text-xs text-gray-500">{t('settings.notifications_desc')}</p>
              </div>
              <Toggle enabled={notificationsEnabled} setEnabled={setNotificationsEnabled} icon={Bell} />
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-red-50 rounded-xl text-red-600">
              <Shield size={20} />
            </div>
            <h2 className="text-lg font-black text-gray-800 uppercase tracking-tighter">{t('settings.security')}</h2>
          </div>
          
          <div className="space-y-4">
            <button className="w-full flex items-center justify-between p-3 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-colors group">
              <div className="flex items-center space-x-3 text-left">
                <Lock size={16} className="text-gray-400 group-hover:text-blue-500" />
                <span className="text-sm font-bold text-gray-700">{t('settings.change_pin')}</span>
              </div>
              <span className="text-[10px] font-black text-blue-600 uppercase">{t('common.update')}</span>
            </button>
            <button className="w-full flex items-center justify-between p-3 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-colors group">
              <div className="flex items-center space-x-3 text-left">
                <User size={16} className="text-gray-400 group-hover:text-blue-500" />
                <span className="text-sm font-bold text-gray-700">{t('settings.profile_verify')}</span>
              </div>
              <span className="text-[10px] font-black text-blue-600 uppercase">{t('common.verify')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

