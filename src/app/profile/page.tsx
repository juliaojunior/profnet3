'use client';

import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';

// Lista de estados do Brasil
const estados = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

// Tipos de rede
const tiposRede = ['Municipal', 'Estadual', 'Federal', 'Privada'];

export default function Profile() {
  const { user } = useAuth();
  const [nome, setNome] = useState('');
  const [area, setArea] = useState('');
  const [estado, setEstado] = useState('');
  const [rede, setRede] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    if (!user) return;

    const fetchUserProfile = async () => {
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setNome(data.displayName || '');
          setArea(data.area || '');
          setEstado(data.estado || '');
          setRede(data.rede || '');
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        setMessage({ text: 'Erro ao carregar dados do perfil.', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

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

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="card">
        <h1 className="text-2xl font-bold text-text mb-6">Meu Perfil</h1>

        {message.text && (
          <div className={`mb-6 px-4 py-3 rounded ${
            message.type === 'success' 
              ? 'bg-green-500 bg-opacity-10 border border-green-500 text-green-500' 
              : 'bg-red-500 bg-opacity-10 border border-red-500 text-red-500'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="nome" className="block text-sm text-text-muted mb-1">
              Nome completo
            </label>
            <input
              id="nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-text focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label htmlFor="area" className="block text-sm text-text-muted mb-1">
              Área / Disciplina
            </label>
            <input
              id="area"
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-text focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Ex: Matemática, Língua Portuguesa, etc."
              required
            />
          </div>

          <div>
            <label htmlFor="estado" className="block text-sm text-text-muted mb-1">
              Estado
            </label>
            <select
              id="estado"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-text focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Selecione um estado</option>
              {estados.map((uf) => (
                <option key={uf} value={uf}>{uf}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="rede" className="block text-sm text-text-muted mb-1">
              Rede
            </label>
            <select
              id="rede"
              value={rede}
              onChange={(e) => setRede(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-text focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Selecione uma rede</option>
              {tiposRede.map((tipo) => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>

          <div>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-primary hover:bg-primary-dark rounded-md text-white font-bold transition-colors"
            >
              {saving ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
