import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/admin-session';
import AdminShell from './AdminShell';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const ok = await isAdminAuthenticated();
  if (!ok) redirect('/admin-login');
  return <AdminShell>{children}</AdminShell>;
}
