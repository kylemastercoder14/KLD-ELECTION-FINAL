
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { getServerSession } from '@/lib/get-session';
import { redirect } from 'next/navigation';
import { User } from '@prisma/client';

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
    if (!session?.user) {
      redirect("/auth/sign-in");
    }

    const user = session.user;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader user={user as User} />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
