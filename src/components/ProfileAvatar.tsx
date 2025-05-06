// components/ProfileAvatar.tsx
'use client';

import { useState } from 'react';
import { auth } from '@/firebase/config';

type ProfileAvatarProps = {
  photoURL: string | null;
  displayName: string;
  uid: string;
  onPhotoUpdate?: (newPhotoURL: string) => void;
};

export default function ProfileAvatar({ photoURL, displayName, uid, onPhotoUpdate }: ProfileAvatarProps) {
  const [currentPhotoURL] = useState(photoURL);
  
  // Gerar iniciais do nome para usar como fallback
  const getInitials = (name: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };
  
  return (
    <div className="profile-avatar-container">
      <div className="profile-avatar">
        {currentPhotoURL ? (
          <img 
            src={currentPhotoURL} 
            alt={displayName}
            className="w-full h-full object-cover rounded-full"
          />
        ) : (
          <div className="avatar-placeholder">
            {getInitials(displayName)}
          </div>
        )}
      </div>
      
      <p className="text-xs text-gray-500 mt-1">
        {auth.currentUser?.providerData.some(provider => provider.providerId === 'google.com')
          ? 'Imagem gerenciada pelo Google'
          : 'Imagem de perfil'}
      </p>
    </div>
  );
}
