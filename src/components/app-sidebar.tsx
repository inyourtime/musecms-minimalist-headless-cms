import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, FileText, Image, Layers, Settings, Compass, Star, LifeBuoy } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
const NavItem = ({ to, icon, children }: { to: string; icon: React.ReactNode; children: React.ReactNode }) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== "/" && location.pathname.startsWith(to));
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive}>
        <Link to={to}>{icon} <span>{children}</span></Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};
export function AppSidebar(): JSX.Element {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="h-6 w-6 rounded-md bg-gradient-to-br from-indigo-500 to-purple-500" />
          <span className="text-lg font-semibold font-display">MuseCMS</span>
        </div>
        <SidebarInput placeholder="Search..." />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <NavItem to="/" icon={<Home />}>Dashboard</NavItem>
          <NavItem to="/library" icon={<FileText />}>Content</NavItem>
          <NavItem to="/media" icon={<Image />}>Media</NavItem>
          <NavItem to="/types" icon={<Layers />}>Content Types</NavItem>
          <NavItem to="/settings" icon={<Settings />}>Settings</NavItem>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}