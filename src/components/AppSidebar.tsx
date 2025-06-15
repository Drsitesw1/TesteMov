
import { BarChart3, Package, Plus, Minus, FileText, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/ThemeToggle';

interface AppSidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

const menuItems = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: BarChart3,
  },
  {
    id: 'products',
    title: 'Produtos',
    icon: Package,
  },
  {
    id: 'entry',
    title: 'Entrada',
    icon: Plus,
  },
  {
    id: 'exit',
    title: 'Saída',
    icon: Minus,
  },
  {
    id: 'reports',
    title: 'Relatórios',
    icon: FileText,
  },
];

const adminMenu = [{
  id: 'users',
  title: 'Usuários',
  icon: User
}]

export function AppSidebar({ currentView, onViewChange }: AppSidebarProps) {
  const { user, logout } = useAuth();

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar">
      <SidebarContent className="bg-sidebar">
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-primary-foreground" />
            </div>
            <h2 className="text-xl font-bold text-sidebar-foreground">StockPro</h2>
            <div className="ml-auto">
              <ThemeToggle />
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-2 bg-sidebar-accent rounded-lg">
            <User className="w-4 h-4 text-sidebar-primary" />
            <span className="text-sm font-medium text-sidebar-foreground">{user?.usuario}</span>
            <Badge variant="outline" className="ml-auto text-xs border-sidebar-border text-sidebar-primary bg-transparent">
              {user?.nivel === 'admin' ? 'Admin' : 'Usuário'}
            </Badge>
          </div>
        </div>
        
        <SidebarGroup className="p-4 flex-1">
          <SidebarGroupLabel className="text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider mb-3">
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    onClick={() => onViewChange(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                      currentView === item.id 
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground border border-sidebar-ring shadow-lg' 
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {/* Menu de ADMIN */}
              {user?.nivel === 'admin' &&
                adminMenu.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => onViewChange(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                        currentView === item.id
                          ? 'bg-sidebar-primary text-sidebar-primary-foreground border border-sidebar-ring shadow-lg'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              }
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="p-4 border-t border-sidebar-border">
          <Button 
            onClick={logout}
            variant="outline" 
            className="w-full flex items-center gap-2 text-destructive hover:text-destructive-foreground hover:bg-destructive border-destructive bg-transparent transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
