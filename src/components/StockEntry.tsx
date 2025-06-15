
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Package, CheckCircle } from 'lucide-react';
import { Product, StockMovement } from '@/pages/Index';
import { toast } from '@/hooks/use-toast';

interface StockEntryProps {
  products: Product[];
  onAddMovement: (movement: Omit<StockMovement, 'id' | 'timestamp' | 'userId'>) => void;
}

const entryReasons = [
  'Compra',
  'Devolução',
  'Transferência entre filiais',
  'Ajuste de inventário',
  'Reposição',
  'Outros'
];

export const StockEntry = ({ products, onAddMovement }: StockEntryProps) => {
  const [formData, setFormData] = useState({
    productId: '',
    quantity: 0,
    reason: '',
    date: new Date().toISOString().split('T')[0],
    observations: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedProduct = products.find(p => p.id === formData.productId);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.productId || formData.quantity <= 0) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um produto e informe uma quantidade válida.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const movement: Omit<StockMovement, 'id' | 'timestamp' | 'userId'> = {
        productId: formData.productId,
        productName: selectedProduct!.name,
        type: 'entry',
        quantity: formData.quantity,
        reason: formData.reason || 'Não especificado',
        date: formData.date,
        observations: formData.observations,
      };

      onAddMovement(movement);

      toast({
        title: "Entrada registrada com sucesso!",
        description: `${formData.quantity} ${selectedProduct!.unit} de ${selectedProduct!.name} adicionado ao estoque.`,
      });

      // Reset form
      setFormData({
        productId: '',
        quantity: 0,
        reason: '',
        date: new Date().toISOString().split('T')[0],
        observations: '',
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao registrar a entrada.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
            <Plus className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          Entrada de Estoque
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Registre a entrada de produtos no estoque</p>
      </div>

      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-gray-100">
            <Package className="w-5 h-5" />
            Nova Entrada
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="product" className="dark:text-gray-200">Produto *</Label>
              <Select value={formData.productId} onValueChange={(value) => handleInputChange('productId', value)}>
                <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
                  <SelectValue placeholder="Selecione um produto" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                  {products.map(product => (
                    <SelectItem key={product.id} value={product.id} className="dark:text-gray-100">
                      <div className="flex items-center gap-3">
                        <span>{product.name}</span>
                        <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-300">
                          {product.currentStock} {product.unit}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedProduct && (
                <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Estoque atual:</span>
                    <span className="font-semibold dark:text-gray-200">
                      {selectedProduct.currentStock} {selectedProduct.unit}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-gray-600 dark:text-gray-400">Categoria:</span>
                    <span className="dark:text-gray-200">{selectedProduct.category}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantity" className="dark:text-gray-200">Quantidade *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity || ''}
                  onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  required
                />
                {selectedProduct && formData.quantity > 0 && (
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    Novo estoque: {selectedProduct.currentStock + formData.quantity} {selectedProduct.unit}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="date" className="dark:text-gray-200">Data *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="reason" className="dark:text-gray-200">Motivo da Entrada</Label>
              <Select value={formData.reason} onValueChange={(value) => handleInputChange('reason', value)}>
                <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
                  <SelectValue placeholder="Selecione o motivo" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                  {entryReasons.map(reason => (
                    <SelectItem key={reason} value={reason} className="dark:text-gray-100">
                      {reason}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="observations" className="dark:text-gray-200">Observações</Label>
              <Textarea
                id="observations"
                value={formData.observations}
                onChange={(e) => handleInputChange('observations', e.target.value)}
                placeholder="Informações adicionais sobre esta entrada..."
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                rows={3}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                'Processando...'
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Registrar Entrada
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
