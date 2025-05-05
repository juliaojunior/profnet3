'use client';

import AppLayout from '@/components/layout/AppLayout';
import { useEffect, useState } from 'react';
import { collection, addDoc, query, orderBy, getDocs, deleteDoc, doc, serverTimestamp, where } from 'firebase/firestore';
import { auth, db } from '@/firebase/config';
import { useRouter } from 'next/navigation';

type UserStats = {
  total: number;
  active: number;
  new: number;
};

type MessageStats = {
  total: number;
  today: number;
  engagement: number;
};

type NewsItem = {
  id: string;
  titulo: string;
  conteudo: string;
  imagem?: string;
  data: Date;
  autor: string;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState<UserStats>({ total: 0, active: 0, new: 0 });
  const [messageStats, setMessageStats] = useState<MessageStats>({ total: 0, today: 0, engagement: 0 });
  const [news, setNews] = useState<NewsItem[]>([]);
  const [newNewsItem, setNewNewsItem] = useState({ titulo: '', conteudo: '', imagem: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      setLoading(true);
      
      try {
        // Verificar se o usuário está autenticado
        if (!auth.currentUser) {
          router.push('/login');
          return;
        }
        
        // Verificar se o usuário é admin
        const userDoc = await getDocs(
          query(
            collection(db, 'users'), 
            where('uid', '==', auth.currentUser.uid), 
            where('role', '==', 'admin')
          )
        );
        
        if (userDoc.empty) {
          // Redirecionar se não for admin
          console.log('Acesso negado: usuário não é administrador');
          router.push('/profile');
          return;
        }
        
        setIsAdmin(true);
        loadDashboardData();
      } catch (error) {
        console.error('Erro ao verificar status de admin:', error);
        router.push('/profile');
      }
    };

    checkAdminStatus();
  }, [router]);

  const loadDashboardData = async () => {
    try {
      // Carregar estatísticas de usuários
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let totalUsers = 0;
      let activeUsers = 0;
      let newUsers = 0;
      
      usersSnapshot.forEach(doc => {
        totalUsers++;
        
        const userData = doc.data();
        const lastLogin = userData.lastLogin?.toDate();
        const createdAt = userData.createdAt?.toDate();
        
        if (lastLogin && lastLogin > new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)) {
          activeUsers++;
        }
        
        if (createdAt && createdAt > new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)) {
          newUsers++;
        }
      });
      
      setUserStats({
        total: totalUsers,
        active: activeUsers,
        new: newUsers
      });
      
      // Carregar estatísticas de mensagens
      const messagesSnapshot = await getDocs(collection(db, 'messages'));
      const todayMessages = messagesSnapshot.docs.filter(doc => {
        const createdAt = doc.data().createdAt?.toDate();
        return createdAt && createdAt > today;
      }).length;
      
      setMessageStats({
        total: messagesSnapshot.size,
        today: todayMessages,
        engagement: Math.round((activeUsers / totalUsers) * 100) || 0
      });
      
      // Carregar notícias
      const newsSnapshot = await getDocs(query(collection(db, 'noticias'), orderBy('data', 'desc')));
      const newsItems: NewsItem[] = [];
      
      newsSnapshot.forEach(doc => {
        const data = doc.data();
        newsItems.push({
          id: doc.id,
          titulo: data.titulo,
          conteudo: data.conteudo,
          imagem: data.imagem,
          data: data.data.toDate(),
          autor: data.autor
        });
      });
      
      setNews(newsItems);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      setError('Erro ao carregar dados. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNews = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newNewsItem.titulo || !newNewsItem.conteudo) {
      setError('Título e conteúdo são obrigatórios.');
      return;
    }
    
    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      await addDoc(collection(db, 'noticias'), {
        titulo: newNewsItem.titulo,
        conteudo: newNewsItem.conteudo,
        imagem: newNewsItem.imagem || null,
        data: serverTimestamp(),
        autor: auth.currentUser?.displayName || 'Admin'
      });
      
      setNewNewsItem({ titulo: '', conteudo: '', imagem: '' });
      setSuccess('Notícia adicionada com sucesso!');
      loadDashboardData(); // Recarregar notícias
    } catch (error) {
      console.error('Erro ao adicionar notícia:', error);
      setError('Erro ao adicionar notícia. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNews = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta notícia?')) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, 'noticias', id));
      setSuccess('Notícia excluída com sucesso!');
      loadDashboardData(); // Recarregar notícias
    } catch (error) {
      console.error('Erro ao excluir notícia:', error);
      setError('Erro ao excluir notícia. Tente novamente.');
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <AppLayout>
      <h1 className="text-3xl font-bold mb-6 text-primary">Dashboard Administrativo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Estatísticas de usuários */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Usuários</h2>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div className="card-body">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-text-muted">Total:</span>
                <span className="text-text font-medium">{userStats.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Ativos (7 dias):</span>
                <span className="text-text font-medium">{userStats.active}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Novos (30 dias):</span>
                <span className="text-text font-medium">{userStats.new}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Estatísticas de mensagens */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Mensagens</h2>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div className="card-body">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-text-muted">Total:</span>
                <span className="text-text font-medium">{messageStats.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Hoje:</span>
                <span className="text-text font-medium">{messageStats.today}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Engajamento:</span>
                <span className="text-text font-medium">{messageStats.engagement}%</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Informações do sistema */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Sistema</h2>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="card-body">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-text-muted">Versão:</span>
                <span className="text-text font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Estado:</span>
                <span className="text-green-500">Online</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Último update:</span>
                <span className="text-text font-medium">{new Date().toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Gerenciamento de Notícias */}
      <div className="card mb-8">
        <div className="card-header">
          <h2 className="card-title">Gerenciar Notícias</h2>
        </div>
        
        <div className="card-body">
          {error && (
            <div className="error-message mb-6">
              <svg className="error-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-4 rounded-lg bg-green-500 bg-opacity-10 border border-green-500 text-green-500">
              {success}
            </div>
          )}
          
          <form onSubmit={handleAddNews} className="mb-6">
            <div className="form-group">
              <label htmlFor="titulo" className="form-label">
                Título
              </label>
              <input
                id="titulo"
                type="text"
                value={newNewsItem.titulo}
                onChange={(e) => setNewNewsItem({ ...newNewsItem, titulo: e.target.value })}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="conteudo" className="form-label">
                Conteúdo
              </label>
              <textarea
                id="conteudo"
                value={newNewsItem.conteudo}
                onChange={(e) => setNewNewsItem({ ...newNewsItem, conteudo: e.target.value })}
                className="form-input min-h-[150px]"
                rows={4}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="imagem" className="form-label">
                URL da Imagem (opcional)
              </label>
              <input
                id="imagem"
                type="url"
                value={newNewsItem.imagem}
                onChange={(e) => setNewNewsItem({ ...newNewsItem, imagem: e.target.value })}
                className="form-input"
                placeholder="https://exemplo.com/imagem.jpg"
              />
            </div>
            
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
            >
              {saving ? 'Adicionando...' : 'Adicionar Notícia'}
            </button>
          </form>
          
          <hr className="border-t border-gray-700 my-6" />
          
          <h3 className="text-xl font-semibold mb-4">Notícias Existentes</h3>
          
          {news.length === 0 ? (
            <p className="text-text-muted">Nenhuma notícia encontrada.</p>
          ) : (
            <div className="space-y-4">
              {news.map((item) => (
                <div key={item.id} className="p-4 bg-background rounded-md border border-gray-700 flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-text mb-1">{item.titulo}</h4>
                    <p className="text-sm text-text-muted mb-2">
                      {item.data.toLocaleDateString('pt-BR')} | {item.autor}
                    </p>
                    <p className="text-sm text-text">
                      {item.conteudo.length > 100 
                        ? `${item.conteudo.substring(0, 100)}...` 
                        : item.conteudo
                      }
                    </p>
                    {item.imagem && (
                      <div className="mt-2">
                        <span className="text-xs text-text-muted">Imagem: </span>
                        <a href={item.imagem} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                          {item.imagem.substring(0, 40)}...
                        </a>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteNews(item.id)}
                    className="text-red-500 hover:text-red-400"
                    title="Excluir notícia"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
