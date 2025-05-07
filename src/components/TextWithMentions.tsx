'use client';

import { useState, useEffect } from 'react';

type TextWithMentionsProps = {
  text: string;
  className?: string;
};

export default function TextWithMentions({ text, className = '' }: TextWithMentionsProps) {
  const [processedText, setProcessedText] = useState<React.ReactNode[]>([]);
  
  useEffect(() => {
    // Regex para encontrar menções: @username
    const mentionRegex = /@(\w+)/g;
    
    // Dividir o texto em partes (texto normal e menções)
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;
    
    while ((match = mentionRegex.exec(text)) !== null) {
      // Adicionar texto antes da menção
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      
      // Adicionar a menção como texto destacado (sem link)
      const username = match[1];
      parts.push(
        <span 
          key={`${match.index}-${username}`}
          className="text-primary font-medium"
        >
          @{username}
        </span>
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    // Adicionar o restante do texto após a última menção
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    
    setProcessedText(parts);
  }, [text]);
  
  return <div className={className}>{processedText}</div>;
}
