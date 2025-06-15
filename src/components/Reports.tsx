
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { FileText, Download, Filter, Calendar, Package, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';
import { Product, StockMovement } from '@/pages/Index';
import { useTheme } from '@/hooks/useTheme';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';

interface ReportsProps {
  products: Product[];
  movements: StockMovement[];
}

export const Reports = ({ products, movements }: ReportsProps) => {
  const { isDark } = useTheme();
  const [filters, setFilters] = useState({
    productId: 'all',
    type: 'all',
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const filteredMovements = movements.filter(movement => {
    const matchesProduct = filters.productId === 'all' || movement.productId === filters.productId;
    const matchesType = filters.type === 'all' || movement.type === filters.type;
    const matchesDateRange = movement.date >= filters.startDate && movement.date <= filters.endDate;
    return matchesProduct && matchesType && matchesDateRange;
  });

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  // Prepare data for charts
  const dailyMovements = filteredMovements.reduce((acc, movement) => {
    const existing = acc.find(item => item.date === movement.date);
    if (existing) {
      if (movement.type === 'entry') {
        existing.entradas += movement.quantity;
      } else {
        existing.saidas += movement.quantity;
      }
    } else {
      acc.push({
        date: movement.date,
        entradas: movement.type === 'entry' ? movement.quantity : 0,
        saidas: movement.type === 'exit' ? movement.quantity : 0,
      });
    }
    return acc;
  }, [] as { date: string; entradas: number; saidas: number }[]);

  const categoryMovements = products.reduce((acc, product) => {
    const productMovements = filteredMovements.filter(m => m.productId === product.id);
    const totalQuantity = productMovements.reduce((sum, m) => sum + m.quantity, 0);
    
    if (totalQuantity > 0) {
      const existing = acc.find(item => item.name === product.category);
      if (existing) {
        existing.value += totalQuantity;
      } else {
        acc.push({ name: product.category, value: totalQuantity });
      }
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

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('Relatório de Movimentações', 20, 20);
    
    // Date range
    doc.setFontSize(12);
    doc.text(`Período: ${new Date(filters.startDate).toLocaleDateString('pt-BR')} - ${new Date(filters.endDate).toLocaleDateString('pt-BR')}`, 20, 35);
    
    // Summary
    const totalEntries = filteredMovements.filter(m => m.type === 'entry').reduce((sum, m) => sum + m.quantity, 0);
    const totalExits = filteredMovements.filter(m => m.type === 'exit').reduce((sum, m) => sum + m.quantity, 0);
    
    doc.text(`Total de Entradas: ${totalEntries}`, 20, 50);
    doc.text(`Total de Saídas: ${totalExits}`, 20, 60);
    doc.text(`Total de Movimentações: ${filteredMovements.length}`, 20, 70);
    
    // Table data
    const tableData = filteredMovements.map(movement => [
      new Date(movement.date).toLocaleDateString('pt-BR'),
      movement.productName,
      movement.type === 'entry' ? 'Entrada' : 'Saída',
      movement.quantity.toString(),
      movement.reason,
      movement.observations || '-'
    ]);
    
    autoTable(doc, {
      head: [['Data', 'Produto', 'Tipo', 'Quantidade', 'Motivo', 'Observações']],
      body: tableData,
      startY: 85,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] }
    });
    
    doc.save(`relatorio-movimentacoes-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleExportCSV = () => {
    const csvData = filteredMovements.map(movement => ({
      Data: new Date(movement.date).toLocaleDateString('pt-BR'),
      Produto: movement.productName,
      Tipo: movement.type === 'entry' ? 'Entrada' : 'Saída',
      Quantidade: movement.quantity,
      Motivo: movement.reason,
      Observações: movement.observations || ''
    }));
    
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `relatorio-movimentacoes-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          Relatórios
        </h1>
        <div className="flex gap-2">
          <Button onClick={handleExportPDF} variant="outline" className="border-border bg-background hover:bg-accent hover:text-accent-foreground">
            <Download className="w-4 h-4 mr-2" />
            PDF
          </Button>
          <Button onClick={handleExportCSV} variant="outline" className="border-border bg-background hover:bg-accent hover:text-accent-foreground">
            <Download className="w-4 h-4 mr-2" />
            CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border shadow-md">
        <CardHeader>
          <CardTitle className="text-card-foreground flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label className="text-card-foreground">Produto</Label>
              <Select value={filters.productId} onValueChange={(value) => handleFilterChange('productId', value)}>
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os produtos</SelectItem>
                  {products.map(product => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-card-foreground">Tipo</Label>
              <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="entry">Entradas</SelectItem>
                  <SelectItem value="exit">Saídas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-card-foreground">Data Inicial</Label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="bg-background border-border text-foreground"
              />
            </div>
            
            <div>
              <Label className="text-card-foreground">Data Final</Label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="bg-background border-border text-foreground"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-border shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <ArrowUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-green-600 dark:text-green-400">Total de Entradas</p>
                <p className="text-2xl font-bold text-card-foreground">
                  {filteredMovements.filter(m => m.type === 'entry').reduce((sum, m) => sum + m.quantity, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                <ArrowDown className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-red-600 dark:text-red-400">Total de Saídas</p>
                <p className="text-2xl font-bold text-card-foreground">
                  {filteredMovements.filter(m => m.type === 'exit').reduce((sum, m) => sum + m.quantity, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">Total de Movimentações</p>
                <p className="text-2xl font-bold text-card-foreground">{filteredMovements.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border shadow-md">
          <CardHeader>
            <CardTitle className="text-card-foreground">Movimentações por Data</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyMovements}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })}
                  stroke={chartColors.axis}
                />
                <YAxis stroke={chartColors.axis} />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
                  contentStyle={{ 
                    backgroundColor: chartColors.tooltip.bg, 
                    border: `1px solid ${chartColors.tooltip.border}`,
                    borderRadius: '8px',
                    color: chartColors.tooltip.text
                  }}
                />
                <Line type="monotone" dataKey="entradas" stroke="#10B981" name="Entradas" strokeWidth={2} />
                <Line type="monotone" dataKey="saidas" stroke="#EF4444" name="Saídas" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-md">
          <CardHeader>
            <CardTitle className="text-card-foreground">Movimentações por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryMovements}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryMovements.map((entry, index) => (
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

      {/* Movement History Table */}
      <Card className="bg-card border-border shadow-md">
        <CardHeader>
          <CardTitle className="text-card-foreground">Histórico de Movimentações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Observações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMovements.slice(0, 20).map(movement => (
                  <TableRow key={movement.id}>
                    <TableCell>
                      {new Date(movement.date).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="font-medium">{movement.productName}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={movement.type === 'entry' ? 'default' : 'destructive'}
                        className={movement.type === 'entry' ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400' : ''}
                      >
                        {movement.type === 'entry' ? 'Entrada' : 'Saída'}
                      </Badge>
                    </TableCell>
                    <TableCell>{movement.quantity}</TableCell>
                    <TableCell>{movement.reason}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {movement.observations || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredMovements.length > 20 && (
              <div className="text-center py-4 text-muted-foreground">
                Mostrando 20 de {filteredMovements.length} registros
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
