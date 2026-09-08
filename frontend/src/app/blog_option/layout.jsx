import RequireAuth from '@/components/common/auth/RequireAuth';

export default function BlogOptionLayout({ children }) {
  return <RequireAuth>{children}</RequireAuth>;
}
