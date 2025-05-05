'use client';

import AppLayout from '@/components/layout/AppLayout';
import { useState, useEffect } from 'react';
import { collection, addDoc, query, orderBy, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/firebase/config';

type Message = {
  id: string;
  content: string;
  createdAt: Date;
  userId: string;
  userDisplayName: string;
  userPhotoURL?: string;
  likes: string[];
};

export default function Messages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const maxCharCount = 400;

  useEffect(() => {
    fetchMessages();
  }, []);

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
          createdAt: data.createdAt?.toDate() || new Date(),
          userId: data.userId,
          userDisplayName: data.userDisplayName,
          userPhotoURL: data.userPhotoURL,
          likes: data.likes || [],
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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    if (!newMessage.trim()) return;
    if (newMessage.length > maxCharCount) return;

    setSending(true);
    setError('');

    try {
      await addDoc(collection(db, 'messages'), {
        content: newMessage,
        createdAt: serverTimestamp(),
        userId: auth.currentUser.uid,
        userDisplayName: auth.currentUser.displayName || 'Usuário',
        userPhotoURL: auth.currentUser.photoURL,
        likes: []
      });

      setNewMessage('');
      fetchMessages();
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      setError('Não foi possível enviar a mensagem. Tente novamente.');
    } finally {
      setSending(false);
    }
  };

  const handleLikeMessage = async (messageId: string) => {
    if (!auth.currentUser) return;

    try {
      const messageRef = doc(db, 'messages', messageId);
      const currentMessage = messages.find(msg => msg.id === messageId);
      
      if (!currentMessage) return;
      
      const userLiked = currentMessage.likes.includes(auth.currentUser.uid);
      
      let updatedLikes = [...currentMessage.likes];
      
      if (userLiked) {
        // Remove o like
        updatedLikes = updatedLikes.filter(id => id !== auth.currentUser?.uid);
      } else {
        // Adiciona o like
        updatedLikes.push(auth.currentUser.uid);
      }
      
      await updateDoc(messageRef, {
        likes: updatedLikes
      });
      
      // Atualiza o estado local
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, likes: updatedLikes } 
            : msg
        )
      );
    } catch (error) {
      console.error('Erro ao curtir mensagem:', error);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <AppLayout>
      <h1 className="text-3xl font-bold mb-6 text-primary">Mensagens</h1>
      
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
      
      <div className="message-compose">
        <form onSubmit={handleSendMessage}>
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="O que você está pensando?"
            className="message-textarea"
            maxLength={maxCharCount}
          />
          <div className="message-actions">
            <span className={`character-count ${newMessage.length > maxCharCount ? 'limit' : ''}`}>
              {newMessage.length}/{maxCharCount}
            </span>
            <button
              type="submit"
              disabled={sending || !newMessage.trim() || newMessage.length > maxCharCount}
              className="btn btn-primary"
            >
              {sending ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
        </form>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center py-8 text-text-muted">
          <svg className="mx-auto h-12 w-12 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <p>Nenhuma mensagem encontrada.</p>
          <p className="mt-2">Seja o primeiro a compartilhar algo com a comunidade!</p>
        </div>
      ) : (
        <div>
          {messages.map((message) => (
            <div key={message.id} className="message-card">
              <div className="message-header">
                {message.userPhotoURL ? (
                  <img 
                    src={message.userPhotoURL} 
                    alt={message.userDisplayName}
                    className="message-avatar"
                  />
                ) : (
                  <div className="message-avatar">
                    {getInitials(message.userDisplayName)}
                  </div>
                )}
                <div className="message-info">
                  <h3 className="message-author">{message.userDisplayName}</h3>
                  <span className="message-date">
                    {message.createdAt.toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
              
              <p className="message-content">{message.content}</p>
              
              <div className="message-actions">
                <button 
                  onClick={() => handleLikeMessage(message.id)}
                  className={`message-action ${message.likes.includes(auth.currentUser?.uid || '') ? 'liked' : ''}`}
                >
                  <svg 
                    className="message-action-icon" 
                    width="20" 
                    height="20" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill={message.likes.includes(auth.currentUser?.uid || '') ? "currentColor" : "none"}
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {message.likes.length > 0 && message.likes.length}
                </button>
                
                <button className="message-action">
                  <svg className="message-action-icon" width="20" height="20" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  Responder
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
