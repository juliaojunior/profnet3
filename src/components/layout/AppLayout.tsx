'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase/config';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }
      
      setUser(user);
      
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists() && userDoc.data().role === 'admin') {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error('Erro ao verificar permissões:', error);
      } finally {
        setLoading(false);
      }
    });
    
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    // Fechar o menu mobile quando a rota mudar
    setMobileMenuOpen(false);
  }, [pathname]);

  const isActive = (path: string) => {
    return pathname === path;
  };
  
  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ 
          border: '4px solid var(--background-light)', 
          borderTopColor: 'var(--primary)', 
          borderRadius: '50%', 
          width: '50px', 
          height: '50px', 
          animation: 'spin 1s linear infinite' 
        }}>
          <style jsx>{`
            @keyframes spin {
              to { transform: rotate(360deg) }
            }
          `}</style>
        </div>
      </div>
    );
  }
  
  // Redirecionar para login se não estiver autenticado
  if (!user) return null;

  return (
    <div className="app-container">
      {/* Cabeçalho móvel */}
      <div className="mobile-header">
        <div className="mobile-brand">ProfNet</div>
        <button 
          className="mobile-menu-button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menu"
        >
          {mobileMenuOpen ? (
            // Ícone X para fechar
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            // Ícone de hambúrguer para abrir
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>
      
      {/* Barra lateral */}
      <div className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <Link href="/profile" className="sidebar-brand">ProfNet</Link>
        </div>
        
        <nav className="sidebar-nav">
          <ul className="sidebar-nav-list">
            <li className="sidebar-nav-item">
              <Link 
                href="/profile" 
                className={`sidebar-nav-link ${isActive('/profile') ? 'active' : ''}`}
              >
                <svg className="sidebar-nav-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Perfil</span>
              </Link>
            </li>
            <li className="sidebar-nav-item">
              <Link 
                href="/news" 
                className={`sidebar-nav-link ${isActive('/news') ? 'active' : ''}`}
              >
                <svg className="sidebar-nav-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                <span>Notícias</span>
              </Link>
            </li>
            <li className="sidebar-nav-item">
              <Link 
                href="/messages" 
                className={`sidebar-nav-link ${isActive('/messages') ? 'active' : ''}`}
              >
                <svg className="sidebar-nav-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <span>Mensagens</span>
              </Link>
            </li>
            <li className="sidebar-nav-item">
              <Link 
                href="/content-generator" 
                className={`sidebar-nav-link ${isActive('/content-generator') ? 'active' : ''}`}
              >
                <svg className="sidebar-nav-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Geração</span>
              </Link>
            </li>
            
            {/* Menu de administrador */}
            {isAdmin && (
              <li className="sidebar-nav-item">
                <Link 
                  href="/admin/dashboard" 
                  className={`sidebar-nav-link ${isActive('/admin/dashboard') ? 'active' : ''}`}
                >
                  <svg className="sidebar-nav-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>Admin</span>
                </Link>
              </li>
            )}
            
            {/* Botão de logout em telas pequenas */}
            <li className="sidebar-nav-item mobile-only">
              <button 
                onClick={handleLogout} 
                className="sidebar-nav-link"
              >
                <svg className="sidebar-nav-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Sair</span>
              </button>
            </li>
          </ul>
        </nav>
        
        <div className="sidebar-footer desktop-only">
          <button 
            onClick={handleLogout} 
            className="sidebar-footer-link"
          >
            <svg className="sidebar-nav-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Sair</span>
          </button>
        </div>
      </div>
      
      {/* Overlay para fechar o menu mobile quando clicado fora */}
      {mobileMenuOpen && (
        <div 
          className="mobile-menu-overlay" 
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}
      
      {/* Área principal de conteúdo */}
      <div className="main-content">
        {children}
      </div>
    </div>
  );
}
