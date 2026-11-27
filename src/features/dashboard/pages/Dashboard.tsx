import { Layout } from '@/shared/components/Layout';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { AdminDashboard } from '@/features/dashboard/components/AdminDashboard';
import { UserDashboard } from '@/features/dashboard/components/UserDashboard';

export const Dashboard = () => {
  const { auth, isAdmin } = useAuth();

  return (
    <Layout title="Dashboard">
      <div className="space-y-2xl">
        <div className="card-elevated p-2xl">
          <h2 className="text-2xl font-semibold mb-sm">Welcome, {auth?.username}!</h2>
          <p className="text-muted-foreground">Manage your retail operations with RetailLite ERP.</p>
        </div>

        {isAdmin ? <AdminDashboard /> : <UserDashboard />}
      </div>
    </Layout>
  );
};
