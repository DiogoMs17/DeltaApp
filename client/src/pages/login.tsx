import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn, Loader2, Lock, HelpCircle, Eye, EyeOff } from "lucide-react";
import logoImage from "./image (2).png";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { HowItWorksModal } from "@/components/how-it-works-modal";


export default function LoginPage() {
  const [accessCode, setAccessCode] = useState("");
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login } = useAuth();

  const loginMutation = useMutation({
    mutationFn: async (code: string) => {
      await login(code);
    },
    onSuccess: () => {
      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo ao sistema de precificação",
      });
      // Force page reload to ensure auth state is updated
      window.location.href = "/dashboard";
    },
    onError: (error: Error) => {
      toast({
        title: "Erro no login",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode.trim()) {
      toast({
        title: "Código obrigatório",
        description: "Por favor, digite seu código de acesso",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate(accessCode);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <Card className="w-full max-w-md mx-4 shadow-2xl border border-gray-200">
        <CardContent className="p-10">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-white rounded-xl mx-auto mb-4 flex items-center justify-center shadow-lg border-2 border-corporate">
              <img src={logoImage} alt="Logo" className="w-16 h-16 object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Sistema de Precificação</h1>
            <p className="text-gray-600">Acesso Administrativo</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="access-code" className="block text-sm font-medium text-gray-700 mb-2">
                Código de Acesso
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  id="access-code"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate focus:border-corporate transition-colors"
                  placeholder="Digite seu código de acesso"
                  disabled={loginMutation.isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  disabled={loginMutation.isPending}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-corporate hover:bg-corporate/90 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-lg"
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  <LogIn className="mr-2" size={16} />
                  Entrar
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Discrete Help Icon */}
      <button
        onClick={() => setShowHowItWorks(true)}
        className="fixed bottom-6 right-6 w-12 h-12 bg-white hover:bg-gray-50 text-gray-600 hover:text-[#e30722] rounded-full shadow-lg hover:shadow-xl border border-gray-200 transition-all duration-200 flex items-center justify-center group"
        title="Como funciona?"
      >
        <HelpCircle className="h-6 w-6 transition-colors duration-200" />
      </button>

      {/* How It Works Modal */}
      <HowItWorksModal 
        open={showHowItWorks}
        onOpenChange={setShowHowItWorks}
      />
    </div>
  );
}