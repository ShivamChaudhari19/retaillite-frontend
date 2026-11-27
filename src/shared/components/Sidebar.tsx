import { useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  Package,
  Boxes,
  FileText,
  FilePlus,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';

export const Sidebar = () => {
  const { isAdmin, logout, auth } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    ...(isAdmin
      ? [
          { path: '/users', label: 'Users', icon: Users },
          { path: '/inventory', label: 'Inventory', icon: Boxes },
        ]
      : []),
    { path: '/categories', label: 'Categories', icon: FolderOpen },
    { path: '/products', label: 'Products', icon: Package },
    { path: '/invoices/new', label: 'Create Invoice', icon: FilePlus },
    { path: '/invoices', label: 'Invoices', icon: FileText },
  ];
  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' || location.pathname === '/dashboard' : location.pathname === path;

  return (
    <aside className="w-64 bg-primary border-r border-border h-screen flex flex-col sticky top-0">
      {/* Header */}
      <div className="p-lg border-b border-white/10">
        <h1 className="text-white font-bold text-lg">RetailLite</h1>
        <p className="text-white/70 text-xs mt-xs">ERP System</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-md py-lg space-y-xs">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-md px-md py-sm rounded-md text-sm font-medium transition-colors ${
                active
                  ? 'bg-white/20 text-white'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="border-t border-white/10 p-lg space-y-md">
        <div className="text-white/80 text-xs">
          <p className="text-white/60">Signed in as</p>
          <p className="font-medium text-white truncate">{auth?.username}</p>
          <p className="text-white/60 text-xs mt-xs">
            {auth?.role?.includes('ROLE_ADMIN') ? 'Admin' : 'User'}
          </p>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-md px-md py-sm rounded-md text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
