'use client';

import AppLayout from '@/components/layout/AppLayout';
import { useState, useEffect, useRef } from 'react';
import { collection, addDoc, query, orderBy, getDocs, updateDoc, doc, serverTimestamp, where } from 'firebase/firestore';
import { auth, db } from '@/firebase/config';
import { useFirestoreCache } from '@/hooks/useFirestoreCache';
// Importações de componentes de animação
import FadeIn from '@/components/animations/FadeIn';
import SlideIn from '@/components/animations/SlideIn';

type Message = {
  id: string;
  content: string;
  createdAt: Date | { toDate: () => Date } | any;
  userId: string;
  userDisplayName: string;
  userPhotoURL?: string;
  likes: string[];
  replyTo?: string | null; // ID da mensagem à qual esta é uma resposta
  parentId?: string | null; // ID da mensagem principal da thread
};

export default function Messages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const maxCharCount = 400;
  
  // Estados para resposta
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [parentMessages, setParentMessages] = useState<{[key: string]: Message}>({});
  const [expandedThreads, setExpandedThreads] = useState<{[key: string]: boolean}>({});

  // Hook para mensagens principais (com cache)
  const {
    data: mainMessagesList,
    loading: loadingMainMessages,
    error: mainMessagesError,
    refreshData: refreshMainMessages
  } = useFirestoreCache<Message>(
    db,
    'messages',
    [where('replyTo', '==', null), orderBy('createdAt', 'desc')],
    []
  );

  // Hook para respostas (com cache)
  const {
    data: repliesList,
    loading: loadingReplies,
    error: repliesError,
    refreshData: refreshReplies
  } = useFirestoreCache<Message>(
    db,
    'messages',
    [where('replyTo', '!=', null), orderBy('replyTo'), orderBy('createdAt', 'desc')],
    []
  );

  // Processar os dados dos hooks de cache
  useEffect(() => {
    // Atualizar estado de loading e erro
    setLoading(loadingMainMessages || loadingReplies);
    
    if (mainMessagesError) {
      setError(`Erro ao carregar mensagens principais: ${mainMessagesError.message}`);
    } else if (repliesError) {
      setError(`Erro ao carregar respostas: ${repliesError.message}`);
    } else {
      setError('');
    }
    
    // Processar mensagens quando ambos os dados estiverem disponíveis
    if (mainMessagesList && repliesList) {
      // Processar mensagens principais
      const processedMainMessages = mainMessagesList.map(msg => ({
        ...msg,
        createdAt: msg.createdAt?.toDate ? msg.createdAt.toDate() : new Date(msg.createdAt),
        likes: msg.likes || [],
        replyTo: msg.replyTo || null,
        parentId: msg.parentId || null
      }));
      
      // Processar respostas
      const processedReplies = repliesList.map(reply => ({
        ...reply,
        createdAt: reply.createdAt?.toDate ? reply.createdAt.toDate() : new Date(reply.createdAt),
        likes: reply.likes || [],
        replyTo: reply.replyTo,
        parentId: reply.parentId || reply.replyTo
      }));
      
      // Mapeamento de IDs de mensagens principais para as próprias mensagens
      const parentMessagesMap: {[key: string]: Message} = {};
      processedMainMessages.forEach(msg => {
        parentMessagesMap[msg.id] = msg;
      });
      
      // Atualizar estados
      setParentMessages(parentMessagesMap);
      setMessages([...processedMainMessages, ...processedReplies]);
    }
  }, [mainMessagesList, repliesList, loadingMainMessages, loadingReplies, mainMessagesError, repliesError]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    if (!newMessage.trim()) return;
    if (newMessage.length > maxCharCount) return;

    setSending(true);
    setError('');

    try {
      const userDoc = await getDocs(query(
        collection(db, 'users'), 
        where('uid', '==', auth.currentUser.uid)
      ));
      
      let userDisplayName = auth.currentUser.displayName || 'Usuário';
      
      if (!userDoc.empty) {
        userDisplayName = userDoc.docs[0].data().displayName || userDisplayName;
      }

      await addDoc(collection(db, 'messages'), {
        content: newMessage,
        createdAt: serverTimestamp(),
        userId: auth.currentUser.uid,
        userDisplayName,
        userPhotoURL: auth.currentUser.photoURL,
        likes: [],
        replyTo: null,
        parentId: null
      });

      setNewMessage('');
      
      // Atualizar cache forçando uma busca fresca
      await refreshMainMessages();
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
      
      // Atualizar o estado local
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, likes: updatedLikes } 
            : msg
        )
      );
      
      // A mensagem pode ser principal ou resposta, atualizar o cache apropriado
      const isMainMessage = !currentMessage.replyTo;
      if (isMainMessage) {
        refreshMainMessages();
      } else {
        refreshReplies();
      }
    } catch (error) {
      console.error('Erro ao curtir mensagem:', error);
    }
  };

  const handleReplyToMessage = (messageId: string) => {
    // Identifica se estamos respondendo a uma mensagem ou cancelando a resposta
    if (replyingTo === messageId) {
      setReplyingTo(null);
      setReplyContent('');
    } else {
      setReplyingTo(messageId);
      setReplyContent('');
    }
  };

  const handleSendReply = async (parentId: string) => {
    if (!auth.currentUser) return;
    if (!replyContent.trim()) return;
    if (replyContent.length > maxCharCount) return;

    setSending(true);
    setError('');

    try {
      const userDoc = await getDocs(query(
        collection(db, 'users'), 
        where('uid', '==', auth.currentUser.uid)
      ));
      
      let userDisplayName = auth.currentUser.displayName || 'Usuário';
      
      if (!userDoc.empty) {
        userDisplayName = userDoc.docs[0].data().displayName || userDisplayName;
      }

      await addDoc(collection(db, 'messages'), {
        content: replyContent,
        createdAt: serverTimestamp(),
        userId: auth.currentUser.uid,
        userDisplayName,
        userPhotoURL: auth.currentUser.photoURL,
        likes: [],
        replyTo: parentId,
        parentId: parentId
      });

      setReplyingTo(null);
      setReplyContent('');
      
      // Atualizar cache forçando uma busca fresca
      await refreshReplies();
    } catch (error) {
      console.error('Erro ao enviar resposta:', error);
      setError('Não foi possível enviar a resposta. Tente novamente.');
    } finally {
      setSending(false);
    }
  };

  const toggleThread = (messageId: string) => {
    setExpandedThreads(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  // Função para renderizar as mensagens principais e suas respostas
  const renderMessages = () => {
    // Agrupar as mensagens por threads
    const threads: {[key: string]: Message[]} = {};
    
    // Primeiro, encontrar todas as mensagens principais
    const mainMessages = messages.filter(msg => !msg.replyTo);
    
    // Para cada mensagem principal, criar uma thread
    mainMessages.forEach(mainMsg => {
      threads[mainMsg.id] = [mainMsg];
    });
    
    // Adicionar as respostas às threads correspondentes
    messages.filter(msg => msg.replyTo).forEach(reply => {
      if (reply.parentId && threads[reply.parentId]) {
        threads[reply.parentId].push(reply);
      }
    });
    
    // Renderizar as threads
    return Object.entries(threads).map(([threadId, threadMessages], index) => {
      const mainMessage = threadMessages[0];
      const replies = threadMessages.slice(1).sort((a, b) => 
        b.createdAt.getTime() - a.createdAt.getTime()
      );
      
      return (
        <SlideIn key={threadId} delay={index * 0.05} direction="up">
          <div className="message-thread mb-6">
            {/* Mensagem principal */}
            <div className="message-card">
              <div className="message-header">
                {mainMessage.userPhotoURL ? (
                  <img 
                    src={mainMessage.userPhotoURL} 
                    alt={mainMessage.userDisplayName}
                    className="message-avatar"
                  />
                ) : (
                  <div className="message-avatar">
                    {getInitials(mainMessage.userDisplayName)}
                  </div>
                )}
                <div className="message-info">
                  <h3 className="message-author">{mainMessage.userDisplayName}</h3>
                  <span className="message-date">
                    {mainMessage.createdAt.toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
              
              <p className="message-content">{mainMessage.content}</p>
              
              <div className="message-actions">
                <button 
                  onClick={() => handleLikeMessage(mainMessage.id)}
                  className={`message-action ${mainMessage.likes.includes(auth.currentUser?.uid || '') ? 'liked' : ''}`}
                >
                  <svg 
                    className="message-action-icon" 
                    width="20" 
                    height="20" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill={mainMessage.likes.includes(auth.currentUser?.uid || '') ? "currentColor" : "none"}
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {mainMessage.likes.length > 0 && mainMessage.likes.length}
                </button>
                
                <button 
                  onClick={() => handleReplyToMessage(mainMessage.id)}
                  className={`message-action ${replyingTo === mainMessage.id ? 'text-primary' : ''}`}
                >
                  <svg 
                    className="message-action-icon" 
                    width="20" 
                    height="20" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  Responder
                </button>
                
                {replies.length > 0 && (
                  <button 
                    onClick={() => toggleThread(mainMessage.id)}
                    className="message-action"
                  >
                    <svg 
                      className="message-action-icon" 
                      width="20" 
                      height="20" 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    {expandedThreads[mainMessage.id] ? 'Ocultar respostas' : `Ver ${replies.length} resposta${replies.length > 1 ? 's' : ''}`}
                  </button>
                )}
              </div>
              
              {/* Formulário de resposta */}
              {replyingTo === mainMessage.id && (
                <FadeIn>
                  <div className="reply-form mt-4 pl-4 border-l-2 border-primary-dark">
                    <div className="flex items-start">
                      <div className="message-avatar mr-2" style={{ width: '2rem', height: '2rem', fontSize: '0.75rem' }}>
                        {auth.currentUser?.photoURL ? (
                          <img 
                            src={auth.currentUser.photoURL} 
                            alt="Você" 
                            className="w-full h-full rounded-full"
                          />
                        ) : (
                          getInitials(auth.currentUser?.displayName || 'Você')
                        )}
                      </div>
                      <div className="flex-1">
                        <textarea
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder={`Responder a ${mainMessage.userDisplayName}...`}
                          className="message-textarea text-sm"
                          rows={2}
                          maxLength={maxCharCount}
                        />
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-text-muted">
                            {replyContent.length}/{maxCharCount}
                          </span>
                          <div className="space-x-2">
                            <button
                              onClick={() => setReplyingTo(null)}
                              className="px-3 py-1 text-sm text-text-muted hover:text-text bg-background hover:bg-background-lighter rounded"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={() => handleSendReply(mainMessage.id)}
                              disabled={sending || !replyContent.trim() || replyContent.length > maxCharCount}
                              className="px-3 py-1 text-sm bg-primary hover:bg-primary-dark text-white rounded disabled:opacity-50"
                            >
                              {sending ? 'Enviando...' : 'Responder'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              )}
            </div>
            
            {/* Respostas */}
            {expandedThreads[mainMessage.id] && replies.length > 0 && (
              <FadeIn>
                <div className="replies-container pl-8 mt-2 space-y-2">
                  {replies.map((reply, replyIndex) => (
                    <SlideIn key={reply.id} delay={replyIndex * 0.03} direction="left">
                      <div className="message-card bg-opacity-80">
                        <div className="message-header">
                          {reply.userPhotoURL ? (
                            <img 
                              src={reply.userPhotoURL} 
                              alt={reply.userDisplayName}
                              className="message-avatar"
                              style={{ width: '2rem', height: '2rem' }}
                            />
                          ) : (
                            <div className="message-avatar" style={{ width: '2rem', height: '2rem', fontSize: '0.75rem' }}>
                              {getInitials(reply.userDisplayName)}
                            </div>
                          )}
                          <div className="message-info">
                            <h3 className="message-author">{reply.userDisplayName}</h3>
                            <span className="message-date">
                              {reply.createdAt.toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                        
                        <p className="message-content">{reply.content}</p>
                        
                        <div className="message-actions">
                          <button 
                            onClick={() => handleLikeMessage(reply.id)}
                            className={`message-action ${reply.likes.includes(auth.currentUser?.uid || '') ? 'liked' : ''}`}
                          >
                            <svg 
                              className="message-action-icon" 
                              width="20" 
                              height="20" 
                              xmlns="http://www.w3.org/2000/svg" 
                              fill={reply.likes.includes(auth.currentUser?.uid || '') ? "currentColor" : "none"}
                              viewBox="0 0 24 24" 
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            {reply.likes.length > 0 && reply.likes.length}
                          </button>
                        </div>
                      </div>
                    </SlideIn>
                  ))}
                </div>
              </FadeIn>
            )}
          </div>
        </SlideIn>
      );
    });
  };

  return (
    <AppLayout>
      <SlideIn>
        <h1 className="text-3xl font-bold mb-6 text-primary">Mensagens</h1>
      </SlideIn>
      
      {error && (
        <FadeIn>
          <div className="error-message mb-6">
            <svg className="error-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            {error}
          </div>
        </FadeIn>
      )}
      
      <FadeIn delay={0.1}>
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
      </FadeIn>
      
      {loading ? (
        <FadeIn delay={0.2}>
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </FadeIn>
      ) : messages.length === 0 ? (
        <FadeIn delay={0.2}>
          <div className="text-center py-8 text-text-muted">
            <svg className="mx-auto h-12 w-12 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <p>Nenhuma mensagem encontrada.</p>
            <p className="mt-2">Seja o primeiro a compartilhar algo com a comunidade!</p>
          </div>
        </FadeIn>
      ) : (
        <div>
          {renderMessages()}
        </div>
      )}
    </AppLayout>
  );
}
