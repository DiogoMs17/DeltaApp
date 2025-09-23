import { useAuth } from "@/lib/auth-context";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { UserCheck, Eye, Settings } from "lucide-react";
import adminIcon from "../pages/admin.png";
import consultaIcon from "../pages/consulta.png";

export default function UserProfileBadge() {
  const { user } = useAuth();

  if (!user) return null;

  const getProfileInfo = () => {
    switch (user.userType) {
      case "admin":
        return {
          label: "Administrador",
          icon: Settings,
          iconSrc: adminIcon,
          variant: "default" as const,
          className: "bg-red-100 text-red-800 hover:bg-red-200",
          tooltip: "Você tem função total sobre o sistema. Gerenciar produtos, aprovar alterações, configurar preços e acessar todos os relatórios"
        };
      case "editor":
        return {
          label: "Editor",
          icon: UserCheck,
          iconSrc: null,
          variant: "secondary" as const,
          className: "bg-blue-100 text-blue-800 hover:bg-blue-200",
          tooltip: "Você pode editar produtos e visualizar relatórios"
        };
      case "consulta":
        return {
          label: "Consulta",
          icon: Eye,
          iconSrc: consultaIcon,
          variant: "outline" as const,
          className: "bg-gray-100 text-gray-800 hover:bg-gray-200",
          tooltip: "Você tem acesso apenas de consulta, visualizar produtos, relatórios e histórico, sem poder fazer alterações"
        };
      default:
        return {
          label: "Usuário",
          icon: UserCheck,
          iconSrc: null,
          variant: "secondary" as const,
          className: "bg-gray-100 text-gray-800 hover:bg-gray-200",
          tooltip: "Acesso básico ao sistema"
        };
    }
  };

  const profile = getProfileInfo();
  const Icon = profile.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <span>
            <Badge variant={profile.variant} className={profile.className}>
              <Icon className="h-3 w-3 mr-1" />
              {profile.label}
            </Badge>
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs" side="bottom" align="center">
          <p>{profile.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
