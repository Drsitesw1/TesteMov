
import axios from 'axios';
import { Product, StockMovement } from '@/pages/Index';

const API_BASE = 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const useAPI = () => {
  // Products API
  const getProducts = async (): Promise<Product[]> => {
    const response = await api.get('/products');
    return response.data;
  };

  const addProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
    const response = await api.post('/products', {
      ...product,
      id: Date.now().toString(),
    });
    return response.data;
  };

  const updateProduct = async (id: string, product: Omit<Product, 'id'>): Promise<Product> => {
    const response = await api.put(`/products/${id}`, product);
    return response.data;
  };

  const deleteProduct = async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  };

  // Movements API
  const getMovements = async (): Promise<StockMovement[]> => {
    const response = await api.get('/movements');
    return response.data;
  };

  const addMovement = async (movement: Omit<StockMovement, 'id' | 'timestamp'>): Promise<StockMovement> => {
    const response = await api.post('/movements', {
      ...movement,
      id: Date.now().toString(),
      timestamp: Date.now(),
    });
    return response.data;
  };

  return {
    getProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    getMovements,
    addMovement,
  };
};
