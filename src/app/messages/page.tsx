'use client';

import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/firebase/config';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';

type Message = {
  id: string;
  content: string;
  createdAt: Date;
  userId: string;
  userDisplayName: string;
  userPhotoURL?: string;
  likes: string[];
  replyTo?: string;
};

export default function Messages() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const maxCharCount = 400;

  useEffect(() => {
    if (!user) return;

    const fetchMessages = async () => {
      try {
        const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const messagesList: Message[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          messagesList.push({
            id: doc.id,
            content: data.content,
            createdAt: data.createdAt.toDate(),
            userId: data.userId,
            userDisplayName: data.userDisplayName,
            userPhotoURL: data.userPhotoURL,
            likes: data.likes || [],
            replyTo: data.replyTo
          });
        });
        
        setMessages(messagesList);
      } catch (error) {
        console.error('Erro ao carregar mensagens:', error);
        setError('Não foi possível carregar as mensagens. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [user]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!newMessage.trim()) return;
    if (newMessage.length > maxCharCount) return;

    setSending(true);
    setError('');

    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      let userDisplayName = user.displayName || 'Usuário';
      
      if (userDoc.exists()) {
        userDisplayName = userDoc.data().displayName || userDisplayName;
      }

      await addDoc(collection(db, 'messages'), {
        content: newMessage,
        createdAt: serverTimestamp(),
        userId: user.uid,
        userDisplayName,
        userPhotoURL: user.photoURL,
        likes: []
      });

      setNewMessage('');
      
      // Recarrega as mensagens para mostrar a nova
      const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const messagesList: Message[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        messagesList.push({
          id: doc.id,
          content: data.content,
          createdAt: data.createdAt.toDate(),
          userId: data.userId,
          userDisplayName: data.userDisplayName,
          userPhotoURL: data.userPhotoURL,
          likes: data.likes || [],
          replyTo: data.replyTo
        });
      });
      
      setMessages(messagesList);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      setError('Não foi possível enviar a mensagem. Tente novamente.');
    } finally {
      setSending(false);
    }
  };

  const handleLikeMessage = async (messageId: string) => {
    if (!user) return;

    try {
      const messageRef = doc(db, 'messages', messageId);
      const messageDoc = await getDoc(messageRef);
      
      if (messageDoc.exists()) {
        const likes = messageDoc.data().likes || [];
        const userLiked = likes.includes(user.uid);
        
        if (userLiked) {
          // Remove o like
          await updateDoc(messageRef, {
            likes: likes.filter((uid: string) => uid !== user.uid)
          });
        } else {
          // Adiciona o like
          await updateDoc(messageRef, {
            likes: [...likes, user.uid]
          });
        }
        
        // Atualiza a lista de mensagens no estado
        setMessages(messages.map(msg => {
          if (msg.id === messageId) {
            const newLikes = userLiked 
              ? msg.likes.filter(uid => uid !== user.uid)
              : [...msg.likes, user.uid];
            
            return { ...msg, likes: newLikes };
          }
          return msg;
        }));
      }
    } catch (error) {
      console.error('Erro ao curtir mensagem:', error);
    }
  };

  return (
    <AppLayout>
      <div>
        <h1 className="text-2xl font-bold text-text mb-6">Mensagens</h1>
        
        {error && (
          <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        <div className="card mb-6">
          <form onSubmit={handleSendMessage}>
            <div className="mb-4">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="O que você está pensando?"
                className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-text focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                rows={3}
                maxLength={maxCharCount}
              />
              <div className="flex justify-between text-text-muted text-sm mt-1">
                <span>Máximo de {maxCharCount} caracteres</span>
                <span className={newMessage.length > maxCharCount ? 'text-red-500' : ''}>
                  {newMessage.length}/{maxCharCount}
                </span>
              </div>
            </div>
            <div>
              <button
                type="submit"
                disabled={sending || newMessage.length > maxCharCount || newMessage.trim() === ''}
                className="px-4 py-2 bg-primary hover:bg-primary-dark rounded-md text-white font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </form>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-text-muted">Nenhuma mensagem encontrada.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="card">
                <div className="flex items-start mb-2">
                  <div className="flex-shrink-0 mr-3">
                    {message.userPhotoURL ? (
                      <img 
                        src={message.userPhotoURL} 
                        alt={message.userDisplayName}
                        className="h-10 w-10 rounded-full"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white">
                        {message.userDisplayName[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-text">{message.userDisplayName}</p>
                    <p className="text-text-muted text-xs">
                      {message.createdAt.toLocaleDateString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                
                <p className="text-text mb-3 whitespace-pre-wrap">{message.content}</p>
                
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => handleLikeMessage(message.id)}
                    className={`flex items-center text-sm ${
                      message.likes.includes(user?.uid || '') 
                        ? 'text-primary' 
                        : 'text-text-muted hover:text-text'
                    }`}
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5 mr-1" 
                      fill={message.likes.includes(user?.uid || '') ? 'currentColor' : 'none'} 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {message.likes.length > 0 && message.likes.length}
                  </button>
                  
                  <button className="flex items-center text-sm text-text-muted hover:text-text">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    Responder
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
