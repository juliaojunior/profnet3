// hooks/useFirestoreCache.ts
import { useState, useEffect } from 'react';
import { collection, query, getDocs, QueryConstraint, Firestore } from 'firebase/firestore';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos em milissegundos

type CachedData<T> = {
  data: T[];
  timestamp: number;
};

export function useFirestoreCache<T>(
  db: Firestore,
  collectionName: string,
  queryConstraints: QueryConstraint[],
  dependencies: any[] = []
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Criar uma chave única para o cache baseada na coleção e constraints
  const getCacheKey = () => {
    return `firestore-cache-${collectionName}-${JSON.stringify(queryConstraints)}`;
  };
  
  // Salvar dados no cache
  const saveToCache = (data: T[]) => {
    try {
      localStorage.setItem(
        getCacheKey(),
        JSON.stringify({
          data,
          timestamp: Date.now(),
        })
      );
    } catch (err) {
      console.warn('Erro ao salvar no cache:', err);
    }
  };
  
  // Buscar dados do cache
  const getFromCache = (): CachedData<T> | null => {
    try {
      const cachedData = localStorage.getItem(getCacheKey());
      if (!cachedData) return null;
      
      return JSON.parse(cachedData) as CachedData<T>;
    } catch (err) {
      console.warn('Erro ao ler o cache:', err);
      return null;
    }
  };
  
  // Verificar se o cache é válido (não expirou)
  const isCacheValid = (cache: CachedData<T>): boolean => {
    return Date.now() - cache.timestamp < CACHE_DURATION;
  };
  
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Tentar buscar do cache primeiro
        const cachedData = getFromCache();
        
        if (cachedData && isCacheValid(cachedData)) {
          // Usar dados do cache se forem válidos
          setData(cachedData.data);
          setLoading(false);
        } else {
          // Buscar dados frescos do Firestore
          const q = query(collection(db, collectionName), ...queryConstraints);
          const snapshot = await getDocs(q);
          
          if (!isMounted) return;
          
          const results = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as T[];
          
          setData(results);
          saveToCache(results);
        }
      } catch (err) {
        if (isMounted) {
          console.error(`Erro ao buscar ${collectionName}:`, err);
          setError(err as Error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, dependencies);
  
  // Função para forçar uma atualização dos dados
  const refreshData = async () => {
    try {
      setLoading(true);
      
      // Buscar dados frescos do Firestore
      const q = query(collection(db, collectionName), ...queryConstraints);
      const snapshot = await getDocs(q);
      
      const results = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];
      
      setData(results);
      saveToCache(results);
      return results;
    } catch (err) {
      console.error(`Erro ao atualizar ${collectionName}:`, err);
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Limpar o cache
  const clearCache = () => {
    try {
      localStorage.removeItem(getCacheKey());
    } catch (err) {
      console.warn('Erro ao limpar o cache:', err);
    }
  };
  
  return { data, loading, error, refreshData, clearCache };
}
