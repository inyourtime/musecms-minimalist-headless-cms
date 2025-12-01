import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, FileText, Image, Layers, Settings, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useUser, useAuthActions } from "@/stores/auth";
const NavItem = ({ to, icon, children }: { to: string; icon: React.ReactNode; children: React.ReactNode }) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== "/" && location.pathname.startsWith(to));
  return (
    <SidebarMenuItem>
      <motion.div whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 400, damping: 10 }}>
        <SidebarMenuButton asChild isActive={isActive}>
          <Link to={to}>{icon} <span>{children}</span></Link>
        </SidebarMenuButton>
      </motion.div>
    </SidebarMenuItem>
  );
};
export function AppSidebar(): JSX.Element {
  const user = useUser();
  const { logout } = useAuthActions();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
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
          {user?.role === 'admin' && (
            <NavItem to="/settings" icon={<Settings />}>Settings</NavItem>
          )}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenuItem>
          <SidebarMenuButton onClick={handleLogout}>
            <LogOut /> <span>Logout</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarFooter>
    </Sidebar>
  );
}