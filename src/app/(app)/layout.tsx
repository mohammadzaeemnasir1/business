import { Nav } from "@/components/nav";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Nav />
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
