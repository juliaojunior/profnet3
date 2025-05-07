'use client';

import { useState, useEffect, useRef } from 'react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/firebase/config';
import SlideIn from '@/components/animations/SlideIn';

type User = {
  uid: string;
  displayName: string;
  photoURL?: string;
};

type MentionSuggestionsProps = {
  text: string;
  onSelectUser: (text: string) => void;
  inputRef: React.RefObject<HTMLTextAreaElement>;
};

export default function MentionSuggestions({ text, onSelectUser, inputRef }: MentionSuggestionsProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [mentionText, setMentionText] = useState<string | null>(null);
  const [cursorPosition, setCursorPosition] = useState({ top: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Buscar usuários do Firestore (uma vez)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Tentar buscar do cache local
        const cachedUsers = localStorage.getItem('users-cache');
        if (cachedUsers) {
          setUsers(JSON.parse(cachedUsers));
          return;
        }
        
        // Buscar usuários do Firestore
        const usersQuery = query(
          collection(db, 'users'),
          limit(50) // Limitar para não sobrecarregar
        );
        
        const snapshot = await getDocs(usersQuery);
        
        const usersList: User[] = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          usersList.push({
            uid: doc.id,
            displayName: data.displayName || data.name || 'Usuário',
            photoURL: data.photoURL
          });
        });
        
        setUsers(usersList);
        
        // Armazenar no cache local
        localStorage.setItem('users-cache', JSON.stringify(usersList));
      } catch (error) {
        console.error('Erro ao buscar usuários:', error);
      }
    };
    
    fetchUsers();
  }, []);
  
  // Processar o texto para buscar menções
  useEffect(() => {
    const mentionMatch = text.match(/@(\w*)$/);
    
    if (mentionMatch) {
      const searchText = mentionMatch[1].toLowerCase();
      setMentionText(searchText);
      
      // Filtrar usuários pelo texto de busca
      const filtered = users
        .filter(user => 
          user.displayName.toLowerCase().includes(searchText)
        )
        .slice(0, 5); // Limitar a 5 sugestões
      
      setFilteredUsers(filtered);
      
      // Calcular posição das sugestões com base no cursor
      if (inputRef.current) {
        const inputElement = inputRef.current;
        const cursorPosition = inputElement.selectionStart || 0;
        
        // Obter a posição do cursor
        const textBeforeCursor = text.substring(0, cursorPosition);
        const lineBreaks = (textBeforeCursor.match(/\n/g) || []).length;
        
        // Posição aproximada
        const lineHeight = 24; // altura aproximada da linha
        
        setCursorPosition({
          top: (lineBreaks + 1) * lineHeight,
          left: 30 // posição aproximada
        });
      }
    } else {
      setMentionText(null);
      setFilteredUsers([]);
    }
  }, [text, users, inputRef]);
  
  // Selecionar um usuário da lista de sugestões
  const handleSelectUser = (displayName: string) => {
    if (!inputRef.current) return;
    
    const cursorPos = inputRef.current.selectionStart || 0;
    const textBeforeMention = text.substring(0, cursorPos).replace(/@\w*$/, '');
    const textAfterMention = text.substring(cursorPos);
    
    // Atualizar o texto com a menção selecionada
    onSelectUser(`${textBeforeMention}@${displayName} ${textAfterMention}`);
    
    // Limpar sugestões
    setMentionText(null);
    setFilteredUsers([]);
  };
  
  if (!mentionText || filteredUsers.length === 0) {
    return null;
  }
  
  return (
    <div 
      ref={containerRef}
      className="absolute bg-background-lighter shadow-lg rounded-lg z-10 max-w-xs"
      style={{
        top: `${cursorPosition.top + 30}px`,
        left: `${cursorPosition.left}px`
      }}
    >
      <SlideIn direction="up">
        <ul className="py-1 divide-y divide-gray-700">
          {filteredUsers.map(user => (
            <li 
              key={user.uid}
              className="px-3 py-2 hover:bg-background-dark cursor-pointer flex items-center"
              onClick={() => handleSelectUser(user.displayName)}
            >
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName} 
                  className="w-6 h-6 rounded-full mr-2"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs mr-2">
                  {user.displayName.substring(0, 2).toUpperCase()}
                </div>
              )}
              <span>{user.displayName}</span>
            </li>
          ))}
        </ul>
      </SlideIn>
    </div>
  );
}
