'use client';

import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/firebase/config';
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
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
  data: Date;
  autor: string;
  imagem?: string;
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userStats, setUserStats] = useState<UserStats>({ total: 0, active: 0, new: 0 });
  const [messageStats, setMessageStats] = useState<MessageStats>({ total: 0, today: 0, engagement: 0 });
  const [news, setNews] = useState<NewsItem[]>([]);
  const [newNewsItem, setNewNewsItem] = useState({ titulo: '', conteudo: '', imagem: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const checkAdmin = async () => {
      try {
        const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', user.uid), where('role', '==', 'admin')));
        
        if (userDoc.empty) {
          // Usuário não é admin, redireciona
          setIsAdmin(false);
          router.push('/profile');
          return;
        }
        
        setIsAdmin(true);
        loadDashboardData();
      } catch (error) {
        console.error('Erro ao verificar permissões:', error);
        router.push('/profile');
      }
    };

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
            data: data.data.toDate(),
            autor: data.autor,
            imagem: data.imagem
          });
        });
        
        setNews(newsItems);
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [user, router]);

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
        autor: user?.displayName || 'Admin'
      });
      
      // Recarregar as notícias
      const newsSnapshot = await getDocs(query(collection(db, 'noticias'), orderBy('data', 'desc')));
      const newsItems: NewsItem[] = [];
      
      newsSnapshot.forEach(doc => {
        const data = doc.data();
        newsItems.push({
          id: doc.id,
          titulo: data.titulo,
          conteudo: data.conteudo,
          data: data.data.toDate(),
          autor: data.autor,
          imagem: data.imagem
        });
      });
      
      setNews(newsItems);
      setNewNewsItem({ titulo: '', conteudo: '', imagem: '' });
      setSuccess('Notícia adicionada com sucesso!');
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
      
      // Atualizar a lista de notícias
      setNews(news.filter(item => item.id !== id));
      setSuccess('Notícia excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir notícia:', error);
      setError('Erro ao excluir notícia. Tente novamente.');
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <AppLayout>
      <div>
        <h1 className="text-2xl font-bold text-text mb-6">Dashboard Administrativo</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Estatísticas de usuários */}
              <div className="card">
                <h2 className="text-lg font-semibold text-text mb-4">Usuários</h2>
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
              
              {/* Estatísticas de mensagens */}
              <div className="card">
                <h2 className="text-lg font-semibold text-text mb-4">Mensagens</h2>
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
              
              {/* Informações do sistema */}
              <div className="card">
                <h2 className="text-lg font-semibold text-text mb-4">Sistema</h2>
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
            
            {/* Gerenciamento de Notícias */}
            <div className="card mb-8">
              <h2 className="text-lg font-semibold text-text mb-4">Gerenciar Notícias</h2>
              
              {error && (
                <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="bg-green-500 bg-opacity-10 border border-green-500 text-green-500 px-4 py-3 rounded mb-4">
                  {success}
                </div>
              )}
              
              <form onSubmit={handleAddNews} className="mb-6">
                <div className="mb-4">
                  <label htmlFor="titulo" className="block text-sm text-text-muted mb-1">
                    Título
                  </label>
                  <input
                    id="titulo"
                    type="text"
                    value={newNewsItem.titulo}
                    onChange={(e) => setNewNewsItem({ ...newNewsItem, titulo: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-text focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="conteudo" className="block text-sm text-text-muted mb-1">
                    Conteúdo
                  </label>
                  <textarea
                    id="conteudo"
                    value={newNewsItem.conteudo}
                    onChange={(e) => setNewNewsItem({ ...newNewsItem, conteudo: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-text focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    rows={4}
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="imagem" className="block text-sm text-text-muted mb-1">
                    URL da Imagem (opcional)
                  </label>
                  <input
                    id="imagem"
                    type="url"
                    value={newNewsItem.imagem}
                    onChange={(e) => setNewNewsItem({ ...newNewsItem, imagem: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-text focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                </div>
                
                <div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-primary hover:bg-primary-dark rounded-md text-white font-bold transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Adicionando...' : 'Adicionar Notícia'}
                  </button>
                </div>
              </form>
              
              <h3 className="text-md font-semibold text-text mb-4">Notícias existentes</h3>
              
              {news.length === 0 ? (
                <p className="text-text-muted">Nenhuma notícia encontrada.</p>
              ) : (
                <div className="space-y-4">
                  {news.map((item) => (
                    <div key={item.id} className="p-4 bg-background rounded-md border border-gray-700">
                      <div className="flex justify-between">
                        <h4 className="font-medium text-text mb-1">{item.titulo}</h4>
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
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}

