import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getCurrentSession } from "@/lib/sessions";
import { type NavMainItem } from "@/types/side-bar.types";
import { HomeIcon, ListTodo } from "lucide-react";
import { redirect } from "next/navigation";

interface CoreLayoutProps {
  children: React.ReactNode;
}

export default async function CoreLayout({ children }: CoreLayoutProps) {
  const { user } = await getCurrentSession();

  if (!user) {
    redirect("/sign-in");
  }

  const menuItems: NavMainItem[] = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <HomeIcon />, // JSX component
      items: [], // No sub-items for Dashboard
    },
    {
      title: "Applications",
      url: "/applications",
      icon: <ListTodo />, // JSX component
      items: [], // No sub-items for Dashboard
    },
  ];

  return (
    <SidebarProvider>
      <AppSidebar data={menuItems} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
