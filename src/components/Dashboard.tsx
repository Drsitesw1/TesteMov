
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Package, DollarSign, AlertTriangle, TrendingUp } from 'lucide-react';
import { Product, StockMovement } from '@/pages/Index';
import { useTheme } from '@/hooks/useTheme';

interface DashboardProps {
  products: Product[];
  movements: StockMovement[];
}

export const Dashboard = ({ products, movements }: DashboardProps) => {
  const { isDark } = useTheme();
  
  const totalProducts = products.length;
  const totalStock = products.reduce((sum, product) => sum + product.currentStock, 0);
  const totalValue = products.reduce((sum, product) => sum + (product.currentStock * product.costPrice), 0);
  const lowStockProducts = products.filter(product => product.currentStock <= product.minStock);

  // Prepare movement data for the last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const movementData = last7Days.map(date => {
    const dayMovements = movements.filter(movement => movement.date === date);
    const entries = dayMovements.filter(m => m.type === 'entry').reduce((sum, m) => sum + m.quantity, 0);
    const exits = dayMovements.filter(m => m.type === 'exit').reduce((sum, m) => sum + m.quantity, 0);
    
    return {
      date: new Date(date).toLocaleDateString('pt-BR', { weekday: 'short' }),
      entradas: entries,
      saidas: exits,
    };
  });

  // Category distribution
  const categoryData = products.reduce((acc, product) => {
    const existing = acc.find(item => item.name === product.category);
    if (existing) {
      existing.value += product.currentStock;
    } else {
      acc.push({ name: product.category, value: product.currentStock });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  // Theme-aware chart colors
  const chartColors = {
    grid: isDark ? '#2A2A2A' : '#e5e7eb',
    axis: isDark ? '#cccccc' : '#6b7280',
    tooltip: {
      bg: isDark ? '#1C1C1C' : '#ffffff',
      border: isDark ? '#2A2A2A' : '#e5e7eb',
      text: isDark ? '#f0f0f0' : '#1f2937'
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500 dark:text-green-400 dark:border-green-400">
          Sistema Online
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-border shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400">Total de Produtos</CardTitle>
            <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">produtos cadastrados</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400">Estoque Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{totalStock}</div>
            <p className="text-xs text-muted-foreground">unidades em estoque</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400">Estoque Baixo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{lowStockProducts.length}</div>
            <p className="text-xs text-muted-foreground">produtos em alerta</p>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <Card className="border-red-500 bg-red-50 dark:bg-red-500/10">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alertas de Estoque Baixo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockProducts.map(product => (
                <Alert key={product.id} className="border-red-200 bg-white dark:border-red-500 dark:bg-card">
                  <AlertDescription className="flex items-center justify-between text-card-foreground">
                    <span className="font-medium">{product.name}</span>
                    <Badge variant="destructive">
                      {product.currentStock} / {product.minStock} mín.
                    </Badge>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border shadow-md">
          <CardHeader>
            <CardTitle className="text-card-foreground">Movimentações (Últimos 7 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={movementData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis dataKey="date" stroke={chartColors.axis} />
                <YAxis stroke={chartColors.axis} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: chartColors.tooltip.bg, 
                    border: `1px solid ${chartColors.tooltip.border}`,
                    borderRadius: '8px',
                    color: chartColors.tooltip.text
                  }}
                />
                <Bar dataKey="entradas" fill="#10B981" name="Entradas" />
                <Bar dataKey="saidas" fill="#EF4444" name="Saídas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-md">
          <CardHeader>
            <CardTitle className="text-card-foreground">Distribuição por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: chartColors.tooltip.bg, 
                    border: `1px solid ${chartColors.tooltip.border}`,
                    borderRadius: '8px',
                    color: chartColors.tooltip.text
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
