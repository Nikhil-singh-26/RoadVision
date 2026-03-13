import { useState, useEffect } from 'react';
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
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });
  const [gpsEnabled, setGpsEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [language, setLanguage] = useState('English');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const handleSave = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

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
          <h1 className="text-2xl font-black text-[#1a237e] uppercase tracking-tight">Portal Configuration</h1>
          <p className="text-sm text-gray-500 font-medium">Manage your system preferences and security</p>
        </div>
      </div>

      {showSuccess && (
        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-xl flex items-center text-green-700 animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 mr-3" />
          <p className="font-bold text-sm">Settings updated successfully!</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Appearance Section */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
              <Sun size={20} />
            </div>
            <h2 className="text-lg font-black text-gray-800 uppercase tracking-tighter">Appearance</h2>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-700">Tactical Dark Mode</p>
                <p className="text-xs text-gray-500">Enable dark interface for night operations</p>
              </div>
              <Toggle enabled={isDarkMode} setEnabled={setIsDarkMode} icon={isDarkMode ? Moon : Sun} />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-700">Interface Language</p>
                <p className="text-xs text-gray-500">Select portal primary language</p>
              </div>
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl text-xs font-bold text-[#1a237e] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option>English</option>
                <option>Hindi (हिन्दी)</option>
                <option>Marathi (मराठी)</option>
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
            <h2 className="text-lg font-black text-gray-800 uppercase tracking-tighter">Privacy & GPS</h2>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-700">GPS Location Access</p>
                <p className="text-xs text-gray-500">Allow portal to track your current position</p>
              </div>
              <Toggle enabled={gpsEnabled} setEnabled={setGpsEnabled} icon={MapPin} />
            </div>

            <div className="flex items-center space-x-2 p-3 bg-amber-50 rounded-2xl border border-amber-100">
              <AlertCircle className="text-amber-600" size={16} />
              <p className="text-[10px] text-amber-700 font-bold leading-tight">
                Disabling GPS will prevent "My Location" features from functioning on the map.
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
            <h2 className="text-lg font-black text-gray-800 uppercase tracking-tighter">Intelligence Alerts</h2>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-700">Push Notifications</p>
                <p className="text-xs text-gray-500">Real-time alerts for critical road damage</p>
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
            <h2 className="text-lg font-black text-gray-800 uppercase tracking-tighter">Security</h2>
          </div>
          
          <div className="space-y-4">
            <button className="w-full flex items-center justify-between p-3 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <Lock size={16} className="text-gray-400" />
                <span className="text-sm font-bold text-gray-700">Change Official Pin</span>
              </div>
              <span className="text-[10px] font-black text-blue-600 uppercase">Update</span>
            </button>
            <button className="w-full flex items-center justify-between p-3 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <User size={16} className="text-gray-400" />
                <span className="text-sm font-bold text-gray-700">Profile Authorization</span>
              </div>
              <span className="text-[10px] font-black text-blue-600 uppercase">Verify</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-12 flex justify-end pb-12">
        <button 
          onClick={handleSave}
          className="flex items-center space-x-2 px-10 py-4 bg-[#1a237e] text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-900/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Save size={20} />
          <span>Save Changes</span>
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
