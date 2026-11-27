import { ReactNode } from 'react';
import { CategoriesList } from '@/features/categories/pages/CategoriesList';
import { Dashboard } from '@/features/dashboard/pages/Dashboard';
import { InventoryList } from '@/features/inventory/pages/InventoryList';
import { ProductsList } from '@/features/products/pages/ProductsList';
import { UsersList } from '@/features/users/pages/UsersList';
import { InvoiceList } from '@/features/invoice/pages/InvoiceList';
import { CreateInvoice } from '@/features/invoice/pages/CreateInvoice';

export interface AppRouteConfig {
  path: string;
  element: ReactNode;
  /** Routes the sidebar hides from non-admins must also be blocked here. */
  requiredRole?: 'ROLE_ADMIN' | 'ROLE_USER';
}

export const routes: AppRouteConfig[] = [
  { path: '/', element: <Dashboard /> },
  { path: '/dashboard', element: <Dashboard /> },
  { path: '/users', element: <UsersList />, requiredRole: 'ROLE_ADMIN' },
  { path: '/products', element: <ProductsList />, },
  { path: '/categories', element: <CategoriesList />,  },
  { path: '/inventory', element: <InventoryList />,requiredRole: 'ROLE_ADMIN' },
  { path: '/invoices', element: <InvoiceList /> },
  { path: '/invoices/new', element: <CreateInvoice /> },
];
