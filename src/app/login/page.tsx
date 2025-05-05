'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, db } from '@/firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/profile');
    } catch (error: any) {
      console.error('Login error:', error);
      setError('Falha no login. Verifique seu email e senha.');
    } finally {
      setLoading(false);
    }
  };


const handleGoogleLogin = async () => {
  setError('');
  setLoading(true);
  
  try {
    const provider = new GoogleAuthProvider();
    console.log("Tentando login com Google...");
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log("Login com Google bem-sucedido!");
    
    // Verificar se o documento do usuário existe no Firestore
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    // Se o documento não existir, criá-lo
    if (!userDoc.exists()) {
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        createdAt: new Date(),
        updatedAt: new Date(),
        role: 'user'
      });
      console.log("Documento do usuário criado no Firestore");
    }
    
    router.push('/profile');
  } catch (error: any) {
    console.error('Google login error:', error);
    setError(`Falha no login com Google: ${error.message}`);
  } finally {
    setLoading(false);
  }
};




  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">ProfNet</h1>
        <h2 className="auth-subtitle">Faça login na sua conta</h2>
        
        {error && (
          <div className="error-message">
            <svg className="error-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-full"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        
        <div className="divider-container">
          <div className="divider-line"></div>
          <span className="divider-text">Ou continue com</span>
          <div className="divider-line"></div>
        </div>
        
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="btn btn-google btn-full"
        >
          <svg className="btn-icon" width="20" height="20" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032c0-3.331,2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
            />
          </svg>
          Google
        </button>
        
        <div className="text-center text-sm mt-4">
          Não tem uma conta?{' '}
          <Link href="/signup" className="link">
            Cadastre-se
          </Link>
        </div>
      </div>
    </div>
  );
}
