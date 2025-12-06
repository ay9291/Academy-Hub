import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Students from "@/pages/students";
import Teachers from "@/pages/teachers";
import Batches from "@/pages/batches";
import Subjects from "@/pages/subjects";
import Attendance from "@/pages/attendance";
import Homework from "@/pages/homework";
import Tests from "@/pages/tests";
import Fees from "@/pages/fees";
import Materials from "@/pages/materials";
import Logbook from "@/pages/logbook";
import Certificates from "@/pages/certificates";
import Complaints from "@/pages/complaints";
import Assets from "@/pages/assets";
import Library from "@/pages/library";
import LostFound from "@/pages/lost-found";
import MyBatches from "@/pages/my-batches";

function AuthenticatedRouter() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/students" component={Students} />
      <Route path="/teachers" component={Teachers} />
      <Route path="/batches" component={Batches} />
      <Route path="/subjects" component={Subjects} />
      <Route path="/attendance" component={Attendance} />
      <Route path="/homework" component={Homework} />
      <Route path="/tests" component={Tests} />
      <Route path="/fees" component={Fees} />
      <Route path="/materials" component={Materials} />
      <Route path="/logbook" component={Logbook} />
      <Route path="/certificates" component={Certificates} />
      <Route path="/complaints" component={Complaints} />
      <Route path="/assets" component={Assets} />
      <Route path="/library" component={Library} />
      <Route path="/lost-found" component={LostFound} />
      <Route path="/my-batches" component={MyBatches} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AuthenticatedLayout() {
  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center justify-between gap-2 p-2 border-b bg-background sticky top-0 z-50">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto">
            <AuthenticatedRouter />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function AppContent() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen" data-testid="loading-auth">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Landing />;
  }

  return <AuthenticatedLayout />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <AppContent />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
