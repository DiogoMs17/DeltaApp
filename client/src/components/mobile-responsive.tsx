import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Menu, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MobileTableProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileTable({ children, className = "" }: MobileTableProps) {
  return (
    <div className={`hidden md:block ${className}`}>
      {children}
    </div>
  );
}

interface MobileCardListProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileCardList({ children, className = "" }: MobileCardListProps) {
  return (
    <div className={`block md:hidden space-y-3 ${className}`}>
      {children}
    </div>
  );
}

interface MobileActionsProps {
  actions: Array<{
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    variant?: "default" | "destructive";
  }>;
  trigger?: React.ReactNode;
}

export function MobileActions({ actions, trigger }: MobileActionsProps) {
  const defaultTrigger = (
    <Button variant="ghost" size="sm">
      <MoreVertical className="h-4 w-4" />
    </Button>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger || defaultTrigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map((action, index) => (
          <DropdownMenuItem
            key={index}
            onClick={action.onClick}
            className={action.variant === "destructive" ? "text-red-600" : ""}
          >
            {action.icon && <span className="mr-2">{action.icon}</span>}
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface MobileDrawerProps {
  title: string;
  children: React.ReactNode;
  trigger: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function MobileDrawer({ title, children, trigger, open, onOpenChange }: MobileDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        {trigger}
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[90vh]">
        <div className="py-4">
          <h2 className="text-lg font-semibold mb-4">{title}</h2>
          <ScrollArea className="h-[calc(90vh-100px)]">
            {children}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveContainer({ children, className = "" }: ResponsiveContainerProps) {
  return (
    <div className={`container mx-auto px-4 py-6 ${className}`}>
      {children}
    </div>
  );
}

interface MobileNavigationProps {
  items: Array<{
    href: string;
    label: string;
    icon: React.ReactNode;
    isActive?: boolean;
  }>;
}

export function MobileNavigation({ items }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => setIsOpen(true)}
        className="p-2"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="w-64">
          <div className="py-4">
            <h2 className="text-lg font-semibold mb-4">Menu</h2>
            <nav className="space-y-2">
              {items.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    item.isActive 
                      ? "bg-corporate text-white" 
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.icon}
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

// Hook para detectar mobile
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useState(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);

    return () => window.removeEventListener('resize', checkDevice);
  });

  return isMobile;
}

// Componente para ocultar em mobile
interface HideOnMobileProps {
  children: React.ReactNode;
}

export function HideOnMobile({ children }: HideOnMobileProps) {
  return <div className="hidden md:block">{children}</div>;
}

// Componente para mostrar apenas em mobile
interface ShowOnMobileProps {
  children: React.ReactNode;
}

export function ShowOnMobile({ children }: ShowOnMobileProps) {
  return <div className="block md:hidden">{children}</div>;
}