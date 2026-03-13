import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Lock, ShieldCheck, AlertCircle, Briefcase } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'officer'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);

    try {
      if (register) {
        await register(formData.name, formData.email, formData.password, formData.role);
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Official registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container p-6">
      <div className="w-full max-w-xl p-10 bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col items-center my-8">
        {/* Government Branding Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="bg-gray-50 p-3 rounded-full border border-gray-100 mb-3">
             <img 
               src="/emblem.jpeg" 
               alt="Emblem of India" 
               className="h-12 w-auto"
             />
          </div>
          <h1 className="text-xl font-black text-[#1a237e] uppercase tracking-tighter leading-tight mb-1">
             NATIONAL HIGHWAY AUTHORITY
          </h1>
          <p className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.2em] border-t border-gray-100 pt-1.5 w-full">
             Access Provisioning System
          </p>
        </div>

        <div className="w-full">
            <h2 className="text-lg font-black text-gray-800 mb-6 flex items-center">
                <User size={18} className="mr-2 text-orange-600" />
                Request New Officer Account
            </h2>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-center text-red-700 text-xs shadow-sm">
                <AlertCircle className="w-4 h-4 mr-3 flex-shrink-0" />
                <p className="font-bold tracking-tight">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 focus:ring-4 focus:ring-[#1a237e]/5 focus:border-[#1a237e] transition-all text-xs font-bold"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Official Role</label>
                    <div className="relative">
                      <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 focus:ring-4 focus:ring-[#1a237e]/5 focus:border-[#1a237e] transition-all text-xs font-bold appearance-none"
                      >
                        <option value="officer">Field Officer</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </div>
                  </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">NIC Email ID</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 focus:ring-4 focus:ring-[#1a237e]/5 focus:border-[#1a237e] transition-all text-xs font-bold"
                    placeholder="official@nic.in"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Access Pin</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 focus:ring-4 focus:ring-[#1a237e]/5 focus:border-[#1a237e] transition-all text-xs font-bold"
                        placeholder="••••••••"
                        required minLength="6"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirm Pin</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 focus:ring-4 focus:ring-[#1a237e]/5 focus:border-[#1a237e] transition-all text-xs font-bold"
                        placeholder="••••••••"
                        required minLength="6"
                      />
                    </div>
                  </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 mt-4 rounded-2xl text-white font-black bg-[#1a237e] hover:bg-[#283593] shadow-xl shadow-blue-900/20 transition-all transform active:scale-[0.98] flex items-center justify-center uppercase tracking-widest text-[10px]"
              >
                {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                ) : 'Submit Provisioning Request'}
              </button>
            </form>

            <div className="mt-8 flex flex-col items-center space-y-3 pt-6 border-t border-gray-100">
               <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Already authorized?</p>
               <Link to="/login" className="text-[#1a237e] font-black text-xs uppercase hover:underline tracking-tighter">
                  Return to Login
               </Link>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
