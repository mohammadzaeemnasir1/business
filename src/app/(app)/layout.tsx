import { Nav } from "@/components/nav";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  // If user has no permissions, they are stuck on a blank page.
  // Redirect to login, maybe their permissions will be updated.
  // In a real app, you'd want a dedicated "pending approval" or error page.
  if (!session.permissions || session.permissions.length === 0) {
    redirect('/login');
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Nav user={session} />
        <SidebarInset>
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="md:hidden mb-4">
              <SidebarTrigger />
            </div>
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
