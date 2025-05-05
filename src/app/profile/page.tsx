'use client';

import AppLayout from '@/components/layout/AppLayout';
import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase/config';

// Lista de estados do Brasil
const estados = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

// Tipos de rede
const tiposRede = ['Municipal', 'Estadual', 'Federal', 'Privada'];

export default function Profile() {
  const [nome, setNome] = useState('');
  const [area, setArea] = useState('');
  const [estado, setEstado] = useState('');
  const [rede, setRede] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        try {
          const docRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setNome(data.displayName || currentUser.displayName || '');
            setArea(data.area || '');
            setEstado(data.estado || '');
            setRede(data.rede || '');
          } else {
            // Se o documento não existe, inicializa com os dados do auth
            setNome(currentUser.displayName || '');
          // Criar o documento do usuário
          await setDoc(docRef, {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName || '',
            photoURL: currentUser.photoURL || '',
            area: '',
            estado: '',
            rede: '',
            createdAt: new Date(),
            updatedAt: new Date(),
            role: 'user'
          });
          
          console.log("Documento do usuário criado a partir do perfil");
          }
        } catch (error) {
          console.error('Erro ao carregar perfil:', error);
          setMessage({ text: 'Erro ao carregar dados do perfil.', type: 'error' });
        } finally {
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, {
        displayName: nome,
        area,
        estado,
        rede,
        updatedAt: new Date()
      });

      setMessage({ text: 'Perfil atualizado com sucesso!', type: 'success' });
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      setMessage({ text: 'Erro ao salvar alterações.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <AppLayout>
      <h1 className="text-3xl font-bold mb-6 text-primary">Meu Perfil</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <div className="profile-header card">
            <div className="profile-avatar">
              {getInitials(nome)}
            </div>
            <div className="profile-info">
              <h2 className="profile-name">{nome || 'Nome não definido'}</h2>
              <p className="profile-email">{user?.email}</p>
              <div className="profile-meta">
                {area && (
                  <span className="profile-meta-item">
                    <svg className="inline-block w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    {area}
                  </span>
                )}
                {estado && (
                  <span className="profile-meta-item">
                    <svg className="inline-block w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {estado}
                  </span>
                )}
                {rede && (
                  <span className="profile-meta-item">
                    <svg className="inline-block w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Rede {rede}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Informações do Perfil</h2>
            </div>
            
            <div className="card-body">
              {message.text && (
                <div className={`p-4 mb-4 rounded-lg ${
                  message.type === 'success' 
                    ? 'bg-green-500 bg-opacity-10 border border-green-500 text-green-500' 
                    : 'bg-red-500 bg-opacity-10 border border-red-500 text-red-500'
                }`}>
                  {message.text}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="form-group">
                  <label htmlFor="nome" className="form-label">
                    Nome completo
                  </label>
                  <input
                    id="nome"
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="area" className="form-label">
                    Área / Disciplina
                  </label>
                  <input
                    id="area"
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="form-input"
                    placeholder="Ex: Matemática, Língua Portuguesa, etc."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="estado" className="form-label">
                      Estado
                    </label>
                    <select
                      id="estado"
                      value={estado}
                      onChange={(e) => setEstado(e.target.value)}
                      className="form-input"
                      required
                    >
                      <option value="">Selecione um estado</option>
                      {estados.map((uf) => (
                        <option key={uf} value={uf}>{uf}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="rede" className="form-label">
                      Rede
                    </label>
                    <select
                      id="rede"
                      value={rede}
                      onChange={(e) => setRede(e.target.value)}
                      className="form-input"
                      required
                    >
                      <option value="">Selecione uma rede</option>
                      {tiposRede.map((tipo) => (
                        <option key={tipo} value={tipo}>{tipo}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="card-footer">
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn btn-primary"
                  >
                    {saving ? 'Salvando...' : 'Salvar alterações'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </AppLayout>
  );
}
