'use client';

import AppLayout from '@/components/layout/AppLayout';
import { db } from '@/firebase/config';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';

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
            data: data.data.toDate(),
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
      <div>
        <h1 className="text-2xl font-bold text-text mb-6">Notícias</h1>
        
        {error && (
          <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : noticias.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-text-muted">Nenhuma notícia encontrada.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {noticias.map((noticia) => (
              <div key={noticia.id} className="card">
                {noticia.imagem && (
                  <div className="mb-4">
                    <img 
                      src={noticia.imagem} 
                      alt={noticia.titulo}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  </div>
                )}
                <h2 className="text-xl font-bold text-text mb-2">{noticia.titulo}</h2>
                <p className="text-text-muted text-sm mb-4">
                  {noticia.data.toLocaleDateString('pt-BR')} | {noticia.autor}
                </p>
                <p className="text-text">
                  {noticia.conteudo.length > 300 
                    ? `${noticia.conteudo.substring(0, 300)}...` 
                    : noticia.conteudo
                  }
                </p>
                {noticia.conteudo.length > 300 && (
                  <div className="mt-4">
                    <button className="text-primary hover:underline">
                      Ler mais
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
