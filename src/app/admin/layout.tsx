
import { Sidebar } from "@/components/admin/Sidebar";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AdminAuthProvider } from "@/components/admin/AdminAuthProvider";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <AdminAuthProvider session={session}>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 min-h-screen overflow-x-hidden">
          <div className="p-4 lg:p-8 animate-in fade-in duration-500">
            {children}
          </div>
        </main>
      </div>
    </AdminAuthProvider>
  );
}
