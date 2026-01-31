
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
        <Sidebar className="z-40" />
        <main className="flex-1 w-full min-h-screen overflow-x-hidden pt-16 lg:pt-0 lg:pl-0 p-4 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {children}
            </div>
        </main>
      </div>
    </AdminAuthProvider>
  );
}
