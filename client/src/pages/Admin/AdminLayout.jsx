import { useEffect, useState } from 'react';
import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  CreditCard, 
  AlertCircle,
  LogOut,
  Menu,
  X
} from 'lucide-react';

function AdminLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Check if user is logged in and is admin
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    
    // Check if user has admin role
    if (parsedUser.role !== 'admin') {
      navigate('/');
      return;
    }

    setUser(parsedUser);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/users', icon: Users, label: 'Users' },
    { path: '/admin/requests', icon: FileText, label: 'Requests' },
    { path: '/admin/transactions', icon: CreditCard, label: 'Transactions' },
    { path: '/admin/reports', icon: AlertCircle, label: 'Reports' },
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800 text-white rounded-md"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 bg-slate-800 border-r border-slate-700`}
      >
        <div className="h-full px-3 py-4 overflow-y-auto">
          <div className="mb-8 px-3">
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            <p className="text-sm text-slate-400 mt-1">{user.email}</p>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin'}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-purple-600 text-white'
                      : 'text-slate-300 hover:bg-slate-700'
                  }`
                }
              >
                <item.icon size={20} className="mr-3" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 mt-8 text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <LogOut size={20} className="mr-3" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default AdminLayout;
