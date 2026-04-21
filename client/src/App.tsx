import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import SelectRole from "./pages/SelectRole";
import Classrooms from "./pages/Classrooms";
import TeacherPanel from "./pages/TeacherPanel";
import Activities from "./pages/Activities";
import Profile from "./pages/Profile";
import { useAuth } from "./_core/hooks/useAuth";

function RoleGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  // Se logado mas sem papel definido (appRole é null ou undefined no tipo)
  if (user && !(user as typeof user & { appRole?: string }).appRole) {
    return <SelectRole />;
  }

  return <>{children}</>;
}

function Router() {
  return (
    <RoleGuard>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/atividades" component={Activities} />
        <Route path="/salas" component={Classrooms} />
        <Route path="/professor" component={TeacherPanel} />
        <Route path="/perfil" component={Profile} />
        <Route path="/selecionar-papel" component={SelectRole} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </RoleGuard>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster richColors position="top-right" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
