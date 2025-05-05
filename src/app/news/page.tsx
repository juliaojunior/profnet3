'use client';

import AppLayout from '@/components/layout/AppLayout';
import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';

type Noticia = {
  id: string;
  titulo: string;
  conteudo: string;
  imagem?: string;
  data: Date;
  autor: string;
};

export default function News() {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNoticias = async () => {
      try {
        const q = query(collection(db, 'noticias'), orderBy('data', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const noticiasList: Noticia[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          noticiasList.push({
            id: doc.id,
            titulo: data.titulo,
            conteudo: data.conteudo,
            imagem: data.imagem,
            data: data.data?.toDate() || new Date(),
            autor: data.autor
          });
        });
        
        setNoticias(noticiasList);
      } catch (error) {
        console.error('Erro ao carregar notícias:', error);
        setError('Não foi possível carregar as notícias. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchNoticias();
  }, []);

  return (
    <AppLayout>
      <h1 className="text-3xl font-bold mb-6 text-primary">Notícias</h1>
      
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
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : noticias.length === 0 ? (
        <div className="text-center py-8 text-text-muted">
          <svg className="mx-auto h-12 w-12 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
          <p>Nenhuma notícia encontrada.</p>
          <p className="mt-2">Novas notícias serão publicadas em breve!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {noticias.map((noticia) => (
            <div key={noticia.id} className="card overflow-hidden">
              {noticia.imagem && (
                <div className="h-48 overflow-hidden">
                  <img 
                    src={noticia.imagem} 
                    alt={noticia.titulo}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  />
                </div>
              )}
              <div className="p-6">
                <h2 className="text-xl font-bold mb-2">{noticia.titulo}</h2>
                <p className="text-text-muted text-sm mb-4">
                  {noticia.data.toLocaleDateString('pt-BR')} | {noticia.autor}
                </p>
                <p className="mb-4">
                  {noticia.conteudo.length > 200 
                    ? `${noticia.conteudo.substring(0, 200)}...` 
                    : noticia.conteudo
                  }
                </p>
                {noticia.conteudo.length > 200 && (
                  <button className="text-primary hover:text-primary-dark hover:underline">
                    Ler mais
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
