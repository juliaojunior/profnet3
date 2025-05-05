'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/firebase/config';
import Link from 'next/link';

export default function Profile() {
  const router = useRouter();
  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (!user) {
        router.push('/login');
      }
    });
    
    return () => unsubscribe();
  }, [router]);
  
  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };
  
  return (
    <div style={{ padding: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: 'var(--primary)', fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
        Meu Perfil
      </h1>
      
      <div style={{ 
        backgroundColor: 'var(--background-light)', 
        borderRadius: '0.5rem', 
        padding: '1.5rem', 
        marginBottom: '1.5rem'  
      }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
          Informações Pessoais
        </h2>
        
        <p style={{ marginBottom: '0.5rem' }}>
          <strong>Email:</strong> {auth.currentUser?.email}
        </p>
        <p style={{ marginBottom: '0.5rem' }}>
          <strong>Nome:</strong> {auth.currentUser?.displayName || 'Não definido'}
        </p>
        
        <div style={{ marginTop: '1.5rem' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            Complete seu perfil para aproveitar todos os recursos do ProfNet
          </p>
        </div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Link 
          href="/messages" 
          style={{ 
            backgroundColor: 'var(--primary)', 
            color: 'white', 
            padding: '0.5rem 1rem', 
            borderRadius: '0.375rem', 
            textDecoration: 'none' 
          }}
        >
          Ver Mensagens
        </Link>
        
        <button 
          onClick={handleLogout}
          style={{ 
            backgroundColor: 'transparent', 
            color: 'var(--text-muted)', 
            padding: '0.5rem 1rem', 
            borderRadius: '0.375rem', 
            border: '1px solid #4B5563', 
            cursor: 'pointer' 
          }}
        >
          Sair
        </button>
      </div>
    </div>
  );
}
