import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShieldCheck, Lock, Mail, AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (login) {
        await login(email, password);
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials or portal sync failure.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="w-full max-w-lg p-10 bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col items-center">
        {/* Government Branding Header */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="bg-gray-50 p-4 rounded-full border border-gray-100 mb-4">
             <img 
               src="/emblem.jpeg" 
               alt="Emblem of India" 
               className="h-16 w-auto"
             />
          </div>
          <h1 className="text-2xl font-black text-[#1a237e] uppercase tracking-tighter leading-tight mb-1">
             GOVERNMENT OF INDIA
          </h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] border-t border-gray-100 pt-2 w-full">
             High Department Monitoring Portal
          </p>
        </div>

        <div className="w-full">
            <h2 className="text-xl font-black text-gray-800 mb-6 flex items-center">
                <ShieldCheck size={20} className="mr-2 text-orange-600" />
                Secure Officer Login
            </h2>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-center text-red-700">
                <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                <p className="font-bold text-xs tracking-tight">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Official ID (Email)</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 bg-gray-50 focus:ring-4 focus:ring-[#1a237e]/5 focus:border-[#1a237e] transition-all text-sm font-bold"
                    placeholder="officer.name@nic.in"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Encrypted Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 bg-gray-50 focus:ring-4 focus:ring-[#1a237e]/5 focus:border-[#1a237e] transition-all text-sm font-bold"
                    placeholder="••••••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 rounded-2xl text-white font-black bg-[#1a237e] hover:bg-[#283593] shadow-xl shadow-blue-900/20 transition-all transform active:scale-[0.98] flex items-center justify-center uppercase tracking-widest text-xs"
              >
                {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                ) : 'Authenticate Credentials'}
              </button>
            </form>

            <div className="mt-10 flex flex-col items-center space-y-4 pt-8 border-t border-gray-100">
               <p className="text-xs text-gray-500 font-medium">New Officer or Admin?</p>
               <Link to="/register" className="text-[#1a237e] font-black text-xs uppercase hover:underline tracking-tighter">
                  Request Portal Access 
               </Link>
            </div>
        </div>
        
        {/* Security Notice */}
        <div className="mt-8 text-center text-[8px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed opacity-50 max-w-xs">
           Authorized personnel only. All access is logged and recorded by the National Highway Authority surveillance center.
        </div>
      </div>
    </div>
  );
};

export default Login;
