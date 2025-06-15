
import { useState } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Dashboard } from '@/components/Dashboard';
import { ProductsCatalog } from '@/components/ProductsCatalog';
import { StockEntry } from '@/components/StockEntry';
import { StockExit } from '@/components/StockExit';
import { Reports } from '@/components/Reports';
import { ProductForm } from '@/components/ProductForm';
import { Login } from '@/components/Login';
import { useStockData } from '@/hooks/useStockData';
import { useAuth } from '@/hooks/useAuth';
import { UsersPage } from '@/components/UsersPage';

export type Product = {
  id: string;
  name: string;
  category: string;
  description: string;
  currentStock: number;
  minStock: number;
  unit: string;
  costPrice: number;
  tags: string[];
  image?: string;
  userId: string;
};

export type StockMovement = {
  id: string;
  productId: string;
  productName: string;
  type: 'entry' | 'exit';
  quantity: number;
  reason: string;
  date: string;
  observations?: string;
  timestamp: number;
  userId: string;
};

const Index = () => {
  const { isAuthenticated, user } = useAuth();
  const { products, movements, loading, addProduct, updateProduct, deleteProduct, addMovement } = useStockData();
  const [currentView, setCurrentView] = useState('dashboard');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <Login />;
  }

  // Show loading while data is being fetched
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground">Carregando dados...</p>
          <p className="text-sm text-muted-foreground mt-2">Certifique-se que o json-server está rodando na porta 3001</p>
        </div>
      </div>
    );
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowProductForm(true);
  };

  const handleSaveProduct = (productData: Omit<Product, 'id' | 'userId'>) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
    } else {
      addProduct(productData);
    }
    setShowProductForm(false);
    setEditingProduct(null);
  };

  const renderCurrentView = () => {
    if (showProductForm) {
      return (
        <ProductForm
          product={editingProduct}
          onSave={handleSaveProduct}
          onCancel={() => {
            setShowProductForm(false);
            setEditingProduct(null);
          }}
        />
      );
    }

    switch (currentView) {
      case 'dashboard':
        return <Dashboard products={products} movements={movements} />;
      case 'products':
        return (
          <ProductsCatalog
            products={products}
            onEdit={handleEditProduct}
            onDelete={deleteProduct}
            onAdd={handleAddProduct}
          />
        );
      case 'entry':
        return <StockEntry products={products} onAddMovement={addMovement} />;
      case 'exit':
        return <StockExit products={products} onAddMovement={addMovement} />;
      case 'reports':
        return <Reports products={products} movements={movements} />;
      case 'users':
        // Só admin pode acessar a tela de usuários:
        return user?.nivel === 'admin' ? <UsersPage /> : <Dashboard products={products} movements={movements} />;
      default:
        return <Dashboard products={products} movements={movements} />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar currentView={currentView} onViewChange={setCurrentView} />
        <main className="flex-1 p-6 bg-background">
          {renderCurrentView()}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
