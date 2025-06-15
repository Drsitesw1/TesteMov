
import { useState, useEffect } from 'react';
import { Product, StockMovement } from '@/pages/Index';
import { useAuth } from '@/hooks/useAuth';
import { useAPI } from '@/hooks/useAPI';
import { toast } from '@/hooks/use-toast';

export const useStockData = () => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [allMovements, setAllMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const api = useAPI();

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [productsData, movementsData] = await Promise.all([
          api.getProducts(),
          api.getMovements(),
        ]);
        setAllProducts(productsData);
        setAllMovements(movementsData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar dados. Verifique se o json-server está rodando na porta 3001.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter data by current user (admin sees all)
  const products = user?.nivel === 'admin'
    ? allProducts
    : allProducts.filter(product => product.userId === user?.usuario);

  const movements = user?.nivel === 'admin'
    ? allMovements
    : allMovements.filter(movement => movement.userId === user?.usuario);

  const addProduct = async (productData: Omit<Product, 'id' | 'userId'>) => {
    try {
      const newProduct = await api.addProduct({
        ...productData,
        userId: user?.usuario || 'admin',
      });
      setAllProducts(prev => [...prev, newProduct]);
      toast({
        title: "Sucesso",
        description: "Produto adicionado com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar produto.",
        variant: "destructive",
      });
    }
  };

  const updateProduct = async (id: string, productData: Omit<Product, 'id' | 'userId'>) => {
    try {
      const existingProduct = allProducts.find(p => p.id === id);
      if (!existingProduct) return;

      const updatedProduct = await api.updateProduct(id, {
        ...productData,
        userId: existingProduct.userId,
      });
      setAllProducts(prev => prev.map(product => 
        product.id === id ? updatedProduct : product
      ));
      toast({
        title: "Sucesso",
        description: "Produto atualizado com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar produto.",
        variant: "destructive",
      });
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await api.deleteProduct(id);
      setAllProducts(prev => prev.filter(product => product.id !== id));
      toast({
        title: "Sucesso",
        description: "Produto removido com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao remover produto:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover produto.",
        variant: "destructive",
      });
    }
  };

  const addMovement = async (movementData: Omit<StockMovement, 'id' | 'timestamp' | 'userId'>) => {
    try {
      const newMovement = await api.addMovement({
        ...movementData,
        userId: user?.usuario || 'admin',
      });

      // Update product stock locally first for immediate UI feedback
      setAllProducts(prev => prev.map(product => {
        if (product.id === movementData.productId) {
          const stockChange = movementData.type === 'entry' 
            ? movementData.quantity 
            : -movementData.quantity;
          const updatedProduct = {
            ...product,
            currentStock: product.currentStock + stockChange
          };
          
          // Update product in the API
          api.updateProduct(product.id, updatedProduct).catch(console.error);
          
          return updatedProduct;
        }
        return product;
      }));

      setAllMovements(prev => [newMovement, ...prev]);
    } catch (error) {
      console.error('Erro ao adicionar movimentação:', error);
      toast({
        title: "Erro",
        description: "Erro ao registrar movimentação.",
        variant: "destructive",
      });
    }
  };

  return {
    products,
    movements,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    addMovement,
  };
};
