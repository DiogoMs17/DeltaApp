
import { QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch, useLocation } from "wouter";
import { useEffect } from "react";
import LoginPage from "@/pages/login";
import DashboardPage from "@/pages/dashboard";
import ProductDetailPage from "@/pages/product-detail";
import NotFoundPage from "@/pages/not-found";
import InsumosManagementPage from "@/pages/insumos-management";
import PendenciasPage from "@/pages/pendencias";
import ApprovalHistoryPage from "@/pages/approval-history";
import AnalyticsPage from "@/pages/analytics";
import HistoryPage from "@/pages/history";
import SearchPage from "@/pages/search";
import HomeRedirect from "@/pages/home-redirect";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { queryClient } from "@/lib/queryClient";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRoutes />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

function AppRoutes() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Switch>
        <Route path="/login" component={LoginPage} />
        <Route path="/dashboard" component={ProtectedRoute(DashboardPage)} />
        <Route path="/product/:id" component={ProtectedRoute(ProductDetailPage)} />
        <Route path="/products/:id" component={ProtectedRoute(ProductDetailPage)} />
        <Route path="/insumos" component={ProtectedRoute(InsumosManagementPage)} />
        <Route path="/pendencias" component={ProtectedRoute(PendenciasPage)} />
        <Route path="/approval-history" component={ProtectedRoute(ApprovalHistoryPage)} />
        <Route path="/analytics" component={ProtectedRoute(AnalyticsPage)} />
        <Route path="/history" component={ProtectedRoute(HistoryPage)} />
        <Route path="/search" component={ProtectedRoute(SearchPage)} />
        <Route path="/" component={HomeRedirect} />
        <Route component={NotFoundPage} />
      </Switch>
    </div>
  );
}

function ProtectedRoute(Component: React.ComponentType) {
  return function ProtectedComponent(props: any) {
    const { user, isLoading } = useAuth();
    const [, setLocation] = useLocation();

    useEffect(() => {
      if (!isLoading && !user) {
        setLocation("/login");
      }
    }, [isLoading, user, setLocation]);

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-corporate mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando...</p>
          </div>
        </div>
      );
    }

    if (!user) {
      return null; // Redirect happening
    }

    return <Component {...props} />;
  };
}

export default App;
