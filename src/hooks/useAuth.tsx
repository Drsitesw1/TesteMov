
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import usuarios from '@/data/usuarios.json';

interface Usuario {
  usuario: string;
  senha: string;
  nivel: 'admin' | 'usuario';
  unidade: string;
}

interface AuthContextType {
  user: Usuario | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Usuario | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('stockpro_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser) as Usuario;
        setUser({
          ...parsed,
          nivel: parsed.nivel === "admin" ? "admin" : "usuario"
        });
      } catch (error) {
        // Remove invalid data and clear user
        localStorage.removeItem('stockpro_user');
        setUser(null);
      }
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    // Busca usuário no arquivo json.
    const foundUser = (usuarios as any[]).find(
      (u) => u.usuario === username && u.senha === password
    );
    if (foundUser) {
      // Corrige tipagem para User
      const typedUser: Usuario = {
        usuario: foundUser.usuario,
        senha: foundUser.senha,
        nivel: foundUser.nivel === "admin" ? "admin" : "usuario",
        unidade: foundUser.unidade
      };
      setUser(typedUser);
      localStorage.setItem('stockpro_user', JSON.stringify(typedUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('stockpro_user');
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
