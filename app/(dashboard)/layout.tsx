// All pages in this group require auth and Supabase — never prerender statically
export const dynamic = 'force-dynamic'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
