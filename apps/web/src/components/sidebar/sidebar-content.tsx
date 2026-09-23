import {
  BookOpen,
  Briefcase,
  Building,
  Calendar,
  GraduationCap,
  Home,
  Inbox,
  Users,
} from "lucide-react";
import { Link } from "react-router";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface SidebarContentProps {
  currentPath: string;
}

export function SidebarContentComponent({ currentPath }: SidebarContentProps) {
  if (currentPath === "/") {
    return null;
  }

  const pathSegments = currentPath.split("/").filter(Boolean);
  const isAdminPath = pathSegments[0] === "admin";
  const associationUUID =
    !isAdminPath && pathSegments[0] ? pathSegments[0] : null;

  let groupLabel = "Menu";
  let items = [{ title: "Home", path: "/", icon: Home }];

  if (isAdminPath) {
    groupLabel = "Administration";
    items = [
      { title: "Users", path: "/admin/users", icon: Users },
      { title: "Associations", path: "/admin/associations", icon: Building },
      { title: "Faculties", path: "/admin/faculties", icon: GraduationCap },
      { title: "Courses", path: "/admin/courses", icon: BookOpen },
      { title: "Requests", path: "/admin/requests", icon: Inbox },
    ];
  } else if (associationUUID) {
    groupLabel = "Menu";
    items = [
      { title: "Home", path: `/${associationUUID}`, icon: Home },
      {
        title: "Services",
        path: `/${associationUUID}/services`,
        icon: Briefcase,
      },
      { title: "Events", path: `/${associationUUID}/events`, icon: Calendar },
    ];
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{groupLabel}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton
                  render={<Link to={item.path} />}
                  isActive={currentPath === item.path}
                >
                  <Icon />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
