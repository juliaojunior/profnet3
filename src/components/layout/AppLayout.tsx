'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    const checkUserRole = async () => {
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
  }, [user, router]);

  // Função para verificar se um link está ativo
  const isActive = (path: string) => {
    return pathname === path;
  };
  
  // Se não houver usuário logado, não renderiza o layout
  if (!user) return null;

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

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
                    : 'text-text-muted hover:bg-gray-800 hover:text-text'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Perfil</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/news" 
                className={`flex items-center px-4 py-2 rounded-md ${
                  isActive('/news') 
                    ? 'bg-primary text-white' 
                    : 'text-text-muted hover:bg-gray-800 hover:text-text'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                <span>Notícias</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/messages" 
                className={`flex items-center px-4 py-2 rounded-md ${
                  isActive('/messages') 
                    ? 'bg-primary text-white' 
                    : 'text-text-muted hover:bg-gray-800 hover:text-text'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <span>Mensagens</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/content-generator" 
                className={`flex items-center px-4 py-2 rounded-md ${
                  isActive('/content-generator') 
                    ? 'bg-primary text-white' 
                    : 'text-text-muted hover:bg-gray-800 hover:text-text'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
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
                      : 'text-text-muted hover:bg-gray-800 hover:text-text'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>Dashboard Admin</span>
                </Link>
              </li>
            )}
          </ul>
        </nav>
        
        <div className="mt-auto px-4">
          <button 
            onClick={handleLogout} 
            className="flex items-center text-text-muted hover:text-text w-full px-4 py-2 rounded-md hover:bg-gray-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />

            </svg>
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
