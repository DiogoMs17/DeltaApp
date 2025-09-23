import { ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock } from "lucide-react";

interface ReadOnlyGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  showMessage?: boolean;
}

export default function ReadOnlyGuard({ 
  children, 
  fallback, 
  showMessage = true 
}: ReadOnlyGuardProps) {
  const { user, permissions } = useAuth();
  
  // If user can edit, show the children (editable content)
  if (permissions?.canEdit) {
    return <>{children}</>;
  }
  
  // If user cannot edit (consultation profile), show fallback or message
  if (fallback) {
    return <>{fallback}</>;
  }
  
  if (showMessage) {
    return (
      <Alert className="border-gray-200 bg-gray-50">
        <Lock className="h-4 w-4" />
        <AlertDescription>
          Você possui acesso apenas de consulta. Esta funcionalidade requer permissões de edição.
        </AlertDescription>
      </Alert>
    );
  }
  
  // Don't show anything if user can't edit and no fallback is provided
  return null;
}

// Helper component for read-only buttons
export function ReadOnlyButton({ 
  children, 
  disabled, 
  className = "", 
  ...props 
}: any) {
  const { permissions } = useAuth();
  
  return (
    <button
      {...props}
      disabled={disabled || !permissions?.canEdit}
      className={`${className} ${
        !permissions?.canEdit ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      title={!permissions?.canEdit ? 'Ação disponível apenas para usuários com permissão de edição' : ''}
    >
      {children}
    </button>
  );
}