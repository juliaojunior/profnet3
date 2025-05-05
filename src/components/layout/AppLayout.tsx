'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  UserIcon, NewspaperIcon, ChatBubbleLeftRightIcon, 
  DocumentTextIcon, ChartBarIcon, ArrowLeftOnRectangleIcon 
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists() && userDoc.data().role === 'admin') {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error('Erro ao verificar permissões:', error);
      }
    };
    
    checkUserRole();
  }, [user]);

  // Função para verificar se um link está ativo
  const isActive = (path: string) => {
    return pathname === path;
  };
  
  // Se não houver usuário logado, não renderiza o layout do app
  if (!user) return <>{children}</>;

  return (
    <div className="flex h-screen bg-background">
      {/* Barra lateral */}
      <div className="w-64 bg-background-light h-full py-6 flex flex-col">
        <div className="px-4 mb-6">
          <h1 className="text-xl font-bold text-primary">ProfNet</h1>
        </div>
        
        <nav className="flex-1">
          <ul className="space-y-2 px-2">
            <li>
              <Link 
                href="/profile" 
                className={`flex items-center px-4 py-2 rounded-md ${
                  isActive('/profile') 
                    ? 'bg-primary text-white' 
                    : 'text-text-muted hover:bg-background-light hover:text-text'
                }`}
              >
                <UserIcon className="h-5 w-5 mr-3" />
                <span>Perfil</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/news" 
                className={`flex items-center px-4 py-2 rounded-md ${
                  isActive('/news') 
                    ? 'bg-primary text-white' 
                    : 'text-text-muted hover:bg-background-light hover:text-text'
                }`}
              >
                <NewspaperIcon className="h-5 w-5 mr-3" />
                <span>Notícias</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/messages" 
                className={`flex items-center px-4 py-2 rounded-md ${
                  isActive('/messages') 
                    ? 'bg-primary text-white' 
                    : 'text-text-muted hover:bg-background-light hover:text-text'
                }`}
              >
                <ChatBubbleLeftRightIcon className="h-5 w-5 mr-3" />
                <span>Mensagens</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/content-generator" 
                className={`flex items-center px-4 py-2 rounded-md ${
                  isActive('/content-generator') 
                    ? 'bg-primary text-white' 
                    : 'text-text-muted hover:bg-background-light hover:text-text'
                }`}
              >
                <DocumentTextIcon className="h-5 w-5 mr-3" />
                <span>Geração de Conteúdo</span>
              </Link>
            </li>
            
            {/* Menu de administrador */}
            {isAdmin && (
              <li>
                <Link 
                  href="/admin/dashboard" 
                  className={`flex items-center px-4 py-2 rounded-md ${
                    isActive('/admin/dashboard') 
                      ? 'bg-primary text-white' 
                      : 'text-text-muted hover:bg-background-light hover:text-text'
                  }`}
                >
                  <ChartBarIcon className="h-5 w-5 mr-3" />
                  <span>Dashboard Admin</span>
                </Link>
              </li>
            )}
          </ul>
        </nav>
        
        <div className="mt-auto px-4">
          <button 
            onClick={() => logout()} 
            className="flex items-center text-text-muted hover:text-text px-4 py-2 w-full"
          >
            <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-3" />
            <span>Sair</span>
          </button>
        </div>
      </div>
      
      {/* Área principal de conteúdo */}
      <div className="flex-1 overflow-auto">
        <main className="p-6 max-w-6xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
