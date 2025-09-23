import { UserRoundCheck, LogOut, Home, Package, History, ClipboardCheck, BarChart3, ChevronDown, FileSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import UserProfileBadge from "@/components/user-profile-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logoImage from "../pages/image (2).png";
import adminIcon from "../pages/admin.png";
import consultaIcon from "../pages/consulta.png";

export default function Navigation() {
  const [location] = useLocation();
  const { user, permissions, logout } = useAuth();

  const isActiveRoute = (route: string) => location === route;
  const isAnalyticsActive = ["/analytics", "/history", "/search"].includes(location);

  return (
    <nav className="bg-gradient-to-r from-white to-gray-50 shadow-md border-b border-gray-100 sticky top-0 z-40 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img src={logoImage} alt="Logo" className="h-10 w-auto object-contain drop-shadow-md hover:scale-105 transition-transform duration-300" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Delta</h1>
              <p className="text-xs text-gray-500 -mt-1">Sistema de Precificação</p>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="flex items-center space-x-2">
            <nav className="flex items-center space-x-1">
              {/* Dashboard */}
              <Link 
                href="/dashboard" 
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActiveRoute("/dashboard") 
                    ? "bg-corporate text-white shadow-lg shadow-corporate/25" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-md"
                }`}
              >
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>

              {/* Insumos */}
              <Link 
                href="/insumos" 
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActiveRoute("/insumos") 
                    ? "bg-corporate text-white shadow-lg shadow-corporate/25" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-md"
                }`}
              >
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Insumos</span>
              </Link>

              {/* Pendências (apenas para admin) */}
              {user?.userType !== 'consulta' && (
                <Link 
                  href="/pendencias" 
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActiveRoute("/pendencias") 
                      ? "bg-corporate text-white shadow-lg shadow-corporate/25" 
                      : "text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-md"
                  }`}
                >
                  <ClipboardCheck className="h-4 w-4" />
                  <span className="hidden sm:inline">Pendências</span>
                </Link>
              )}

              {/* Analytics Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isAnalyticsActive 
                        ? "bg-corporate text-white shadow-lg shadow-corporate/25" 
                        : "text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-md"
                    }`}
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span className="hidden sm:inline">Relatórios</span>
                    <ChevronDown className="h-3 w-3 opacity-70" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 mt-2 bg-white shadow-xl border border-gray-100 rounded-xl">
                  <DropdownMenuItem asChild>
                    <Link 
                      href="/analytics" 
                      className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <BarChart3 className="h-4 w-4 text-corporate" />
                      Analytics
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link 
                      href="/history" 
                      className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <History className="h-4 w-4 text-corporate" />
                      Histórico
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link 
                      href="/search" 
                      className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <FileSearch className="h-4 w-4 text-corporate" />
                      Pesquisa Avançada
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
            
            {/* User Section */}
            <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-corporate to-red-600 rounded-full flex items-center justify-center">
                  <UserRoundCheck className="h-4 w-4 text-white" />
                </div>
                <div className="hidden md:block">
                  <div className="flex items-center gap-3">
                    {user?.userType === 'admin' && (
                      <img 
                        src={adminIcon} 
                        alt="Admin" 
                        className="h-8 w-8 object-contain" 
                      />
                    )}
                    {user?.userType === 'consulta' && (
                      <img 
                        src={consultaIcon} 
                        alt="Consulta" 
                        className="h-8 w-8 object-contain" 
                      />
                    )}
                    <div className="flex flex-col">
                      <p className="text-sm font-medium text-gray-900">{user?.name || "Usuário"}</p>
                      <UserProfileBadge />
                    </div>
                  </div>
                </div>
              </div>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200 rounded-lg p-2"
                onClick={logout}
                title="Sair"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
