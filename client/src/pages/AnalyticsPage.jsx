import { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  AlertTriangle,
  Clock3,
  CheckCircle2,
  Calendar,
  MapPin
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AnalyticsPage = () => {
  const { t } = useLanguage();
  const [potholes, setPotholes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data } = await api.get('/potholes');
      setPotholes(data);
    } catch (err) {
      setError('Failed to fetch analytics data.');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityData = () => {
    const counts = { high: 0, medium: 0, low: 0 };
    potholes.forEach(p => {
      counts[p.severityLevel]++;
    });
    return {
      labels: [t('map.critical'), t('map.moderate'), t('map.minor')],
      datasets: [
        {
          label: t('dashboard.stats_detected'),
          data: [counts.high, counts.medium, counts.low],
          backgroundColor: [
            'rgba(239, 68, 68, 0.8)', // Red
            'rgba(249, 115, 22, 0.8)', // Orange
            'rgba(34, 197, 94, 0.8)',  // Green
          ],
          borderColor: [
            'rgb(239, 68, 68)',
            'rgb(249, 115, 22)',
            'rgb(34, 197, 94)',
          ],
          borderWidth: 1,
          borderRadius: 8,
        },
      ],
    };
  };

  const getStatusData = () => {
    const counts = { reported: 0, under_repair: 0, fixed: 0 };
    potholes.forEach(p => {
      counts[p.status]++;
    });
    return {
      labels: [t('dashboard.status_reported'), t('dashboard.status_repairing'), t('dashboard.status_fixed')],
      datasets: [
        {
          data: [counts.reported, counts.under_repair, counts.fixed],
          backgroundColor: [
            'rgba(30, 58, 138, 0.7)',  // Blue 900
            'rgba(249, 115, 22, 0.7)', // Orange
            'rgba(34, 197, 94, 0.7)',  // Green
          ],
          borderColor: [
            '#ffffff',
            '#ffffff',
            '#ffffff',
          ],
          borderWidth: 2,
        },
      ],
    };
  };

  const getTrendData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const counts = last7Days.map(date => {
      return potholes.filter(p => p.detectedAt?.startsWith(date)).length;
    });

    return {
      labels: last7Days.map(d => new Date(d).toLocaleDateString(undefined, { weekday: 'short' })),
      datasets: [
        {
          label: t('dashboard.stats_detected'),
          data: counts,
          fill: true,
          borderColor: '#1a237e',
          backgroundColor: 'rgba(26, 35, 126, 0.1)',
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#1a237e',
        },
      ],
    };
  };

  const getAvgConfidence = () => {
    if (potholes.length === 0) return '0%';
    const sum = potholes.reduce((acc, p) => acc + (p.detectionConfidence || 0), 0);
    return ((sum / potholes.length) * 100).toFixed(1) + '%';
  };

  const getRepairTAT = () => {
    const fixedPotholes = potholes.filter(p => p.status === 'fixed' && p.detectedAt && p.updatedAt);
    if (fixedPotholes.length === 0) return 'N/A';
    
    const totalMs = fixedPotholes.reduce((acc, p) => {
      return acc + (new Date(p.updatedAt) - new Date(p.detectedAt));
    }, 0);
    
    const avgDays = totalMs / fixedPotholes.length / (1000 * 60 * 60 * 24);
    return avgDays.toFixed(1) + ' Days';
  };
  
  const getActiveTickets = () => {
    return potholes.filter(p => p.status !== 'fixed').length.toString();
  };

  if (loading) return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-[#f8faff] p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#1a237e] border-t-transparent mb-4"></div>
        <p className="text-sm font-black text-[#1a237e] tracking-widest uppercase">{t('common.loading')}</p>
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto text-left">
      {/* Header */}
      <div className="mb-8 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
        <div>
           <div className="flex items-center space-x-2 text-[#1a237e] mb-1">
              <BarChart3 size={24} className="text-orange-500" />
              <h1 className="text-2xl font-black uppercase tracking-tight">{t('nav.analytics')}</h1>
           </div>
           <p className="text-sm text-gray-500 font-medium">Predictive modeling and historical damage distribution</p>
        </div>
        <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-xl">
           <Calendar size={16} className="text-[#1a237e]" />
           <span className="text-xs font-bold text-[#1a237e] uppercase tracking-wider">{new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
        </div>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-center text-red-700 text-left">
           <AlertTriangle className="mr-3" />
           <p className="font-bold text-sm tracking-tight">{error}</p>
        </div>
      )}

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 text-left">
        
        {/* Severity Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
           <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                 <div className="p-2 bg-red-50 rounded-lg text-red-600">
                    <AlertTriangle size={18} />
                 </div>
                 <h3 className="font-black text-[#1a237e] uppercase tracking-tight text-sm">Damage Intensity Profile</h3>
              </div>
           </div>
           <div className="h-[300px] w-full items-center flex justify-center">
              <Bar 
                data={getSeverityData()} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { beginAtZero: true, grid: { borderDash: [5, 5] } },
                    x: { grid: { display: false } }
                  }
                }} 
              />
           </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
           <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                 <div className="p-2 bg-blue-50 rounded-lg text-[#1a237e]">
                    <PieChart size={18} />
                 </div>
                 <h3 className="font-black text-[#1a237e] uppercase tracking-tight text-sm">Resolution Efficiency</h3>
              </div>
           </div>
           <div className="h-[300px] w-full flex justify-center">
              <Doughnut 
                data={getStatusData()}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 6, font: { weight: 'bold', size: 10 } } }
                  }
                }}
              />
           </div>
        </div>

        {/* Trend Analysis */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
           <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                 <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                    <TrendingUp size={18} />
                 </div>
                 <h3 className="font-black text-[#1a237e] uppercase tracking-tight text-sm">Incident Momentum (Past 7 Days)</h3>
              </div>
           </div>
           <div className="h-[300px] w-full">
              <Line 
                data={getTrendData()}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { beginAtZero: true, grid: { borderDash: [2, 2] } },
                    x: { grid: { display: false } }
                  }
                }}
              />
           </div>
        </div>
      </div>

      {/* Summary Stats Footer */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
         {[
           { label: 'Active Reports', value: getActiveTickets(), icon: <MapPin size={16}/>, bgClass: 'bg-red-50', textClass: 'text-red-600' },
           { label: 'Avg Confidence', value: getAvgConfidence(), icon: <TrendingUp size={16}/>, bgClass: 'bg-blue-50', textClass: 'text-blue-600' },
           { label: 'Repair TAT', value: getRepairTAT(), icon: <Clock3 size={16}/>, bgClass: 'bg-orange-50', textClass: 'text-orange-600' },
           { label: 'Fleet Status', value: 'Active', icon: <CheckCircle2 size={16}/>, bgClass: 'bg-green-50', textClass: 'text-green-600' }
         ].map((stat, i) => (
           <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 flex items-center space-x-3 shadow-sm">
              <div className={`p-2 rounded-lg ${stat.bgClass} ${stat.textClass}`}>
                 {stat.icon}
              </div>
              <div>
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                 <p className="text-sm font-black text-gray-900">{stat.value}</p>
              </div>
           </div>
         ))}
      </div>
    </div>
  );
};

export default AnalyticsPage;

