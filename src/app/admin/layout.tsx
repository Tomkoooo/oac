
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
      <div className="flex min-h-screen bg-background relative selection:bg-primary/20">
        <Sidebar />
        <main className="flex-1 w-full min-h-screen overflow-x-hidden">
            {children}
        </main>
      </div>
    </AdminAuthProvider>
  );
}
