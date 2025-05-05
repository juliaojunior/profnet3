'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/firebase/config';

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
      await signInWithPopup(auth, provider);
      console.log("Login com Google bem-sucedido!");
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
          <span style={{ marginRight: '8px' }}>G</span> Google
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
