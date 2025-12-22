import { useEffect, useState } from 'react';
import { Users, FileText, CheckCircle, AlertCircle, DollarSign, UserX } from 'lucide-react';
import UsersBarChart from '../../components/Admin/UsersBarChart';
import SourcesPieChart from '../../components/Admin/SourcesPieChart';
import { apiFetch } from '../../utils/apiFetch';
import { API_BASE } from '../../utils/apiConfig';

function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`${API_BASE}/api/admin/overview`, {
        method: 'GET',
      });

      const response = await res.json();

      if (response.success) {
        setData(response.data);
      } else {
        setError(response.message || 'Failed to load dashboard data');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white text-xl">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-400 text-xl">{error}</div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Users',
      value: data?.counters?.totalUsers || 0,
      icon: Users,
      color: 'bg-purple-600',
    },
    {
      title: 'Blocked Users',
      value: data?.counters?.blockedUsers || 0,
      icon: UserX,
      color: 'bg-red-600',
    },
    {
      title: 'Active Requests',
      value: data?.counters?.activeRequests || 0,
      icon: FileText,
      color: 'bg-blue-600',
    },
    {
      title: 'Finished Requests',
      value: data?.counters?.finishedRequests || 0,
      icon: CheckCircle,
      color: 'bg-green-600',
    },
    {
      title: 'Open Reports',
      value: data?.counters?.openReports || 0,
      icon: AlertCircle,
      color: 'bg-orange-600',
    },
    {
      title: 'Total Volume',
      value: `$${data?.counters?.totalVolume || 0}`,
      icon: DollarSign,
      color: 'bg-indigo-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-1">Welcome to the admin dashboard</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">{stat.title}</p>
                <p className="text-white text-3xl font-bold mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon size={24} className="text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-xl font-bold text-white mb-4">User Growth</h2>
          <UsersBarChart data={data?.barData || []} />
        </div>

        {/* Pie Chart */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-xl font-bold text-white mb-4">Request Types</h2>
          <SourcesPieChart data={data?.pieData || []} />
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
