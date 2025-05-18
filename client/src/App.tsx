import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/context/ThemeProvider";
import { AuthProvider } from "@/context/AuthContext";

import MainLayout from "@/layouts/MainLayout";
import Dashboard from "@/pages/Dashboard";
import Students from "@/pages/Students";
import Teachers from "@/pages/Teachers";
import Classes from "@/pages/Classes";
import AttendancePage from "@/pages/Attendance";
import Grades from "@/pages/Grades";
import Settings from "@/pages/Settings";
import Help from "@/pages/Help";
import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <TooltipProvider>
            <Router />
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      
      <Route path="/">
        <MainLayout>
          <Dashboard />
        </MainLayout>
      </Route>
      
      <Route path="/students">
        <MainLayout>
          <Students />
        </MainLayout>
      </Route>
      
      <Route path="/teachers">
        <MainLayout>
          <Teachers />
        </MainLayout>
      </Route>
      
      <Route path="/classes">
        <MainLayout>
          <Classes />
        </MainLayout>
      </Route>
      
      <Route path="/attendance">
        <MainLayout>
          <AttendancePage />
        </MainLayout>
      </Route>
      
      <Route path="/grades">
        <MainLayout>
          <Grades />
        </MainLayout>
      </Route>
      
      <Route path="/settings">
        <MainLayout>
          <Settings />
        </MainLayout>
      </Route>
      
      <Route path="/help">
        <MainLayout>
          <Help />
        </MainLayout>
      </Route>
      
      <Route>
        <MainLayout>
          <NotFound />
        </MainLayout>
      </Route>
    </Switch>
  );
}

export default App;
