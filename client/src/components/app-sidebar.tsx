import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  ClipboardCheck,
  CreditCard,
  FileText,
  MessageSquare,
  Package,
  Library,
  Search,
  Award,
  BookMarked,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const adminMenuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Students", url: "/students", icon: Users },
  { title: "Teachers", url: "/teachers", icon: GraduationCap },
  { title: "Batches", url: "/batches", icon: Calendar },
  { title: "Subjects", url: "/subjects", icon: BookOpen },
  { title: "Attendance", url: "/attendance", icon: ClipboardCheck },
  { title: "Homework", url: "/homework", icon: FileText },
  { title: "Tests", url: "/tests", icon: Award },
  { title: "Fees", url: "/fees", icon: CreditCard },
  { title: "Materials", url: "/materials", icon: BookMarked },
  { title: "Logbook", url: "/logbook", icon: BookOpen },
  { title: "Certificates", url: "/certificates", icon: Award },
];

const adminExtraItems = [
  { title: "Complaints", url: "/complaints", icon: MessageSquare },
  { title: "Assets", url: "/assets", icon: Package },
  { title: "Library", url: "/library", icon: Library },
  { title: "Lost & Found", url: "/lost-found", icon: Search },
];

const teacherMenuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "My Batches", url: "/my-batches", icon: Calendar },
  { title: "Attendance", url: "/attendance", icon: ClipboardCheck },
  { title: "Homework", url: "/homework", icon: FileText },
  { title: "Tests", url: "/tests", icon: Award },
  { title: "Logbook", url: "/logbook", icon: BookOpen },
  { title: "Materials", url: "/materials", icon: BookMarked },
];

const parentMenuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Attendance", url: "/attendance", icon: ClipboardCheck },
  { title: "Homework", url: "/homework", icon: FileText },
  { title: "Test Results", url: "/tests", icon: Award },
  { title: "Fees", url: "/fees", icon: CreditCard },
  { title: "Materials", url: "/materials", icon: BookMarked },
  { title: "Complaints", url: "/complaints", icon: MessageSquare },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  
  const role = user?.role || "parent";
  
  const getMenuItems = () => {
    switch (role) {
      case "admin":
        return adminMenuItems;
      case "teacher":
        return teacherMenuItems;
      case "parent":
      case "student":
        return parentMenuItems;
      default:
        return parentMenuItems;
    }
  };

  const menuItems = getMenuItems();

  const getRoleBadgeVariant = () => {
    switch (role) {
      case "admin":
        return "default";
      case "teacher":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
            <GraduationCap className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold truncate" data-testid="text-sidebar-title">ILT Academy</h2>
            <p className="text-xs text-muted-foreground truncate">Management System</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location === item.url}
                    data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {role === "admin" && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminExtraItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={location === item.url}
                      data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-3 h-auto py-2" data-testid="button-user-menu">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.profileImageUrl || undefined} alt={user?.firstName || "User"} />
                <AvatarFallback className="text-xs">
                  {user?.firstName?.[0] || "U"}{user?.lastName?.[0] || ""}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium truncate" data-testid="text-user-name">
                  {user?.firstName} {user?.lastName}
                </p>
                <Badge variant={getRoleBadgeVariant()} className="text-[10px] capitalize">
                  {role}
                </Badge>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem asChild data-testid="menu-item-profile">
              <Link href="/profile" className="flex items-center w-full">
                <User className="mr-2 h-4 w-4" />
                My Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem data-testid="menu-item-settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild data-testid="menu-item-logout">
              <a href="/api/logout" className="text-destructive flex items-center w-full">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
