import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Offline() {
  const router = useRouter();

  useEffect(() => {
    // Verificar se a conexão foi restabelecida
    const handleOnline = () => {
      router.push('/');
    };

    window.addEventListener('online', handleOnline);

    // Função para tentar se reconectar periodicamente
    const checkConnection = setInterval(() => {
      if (navigator.onLine) {
        router.push('/');
      }
    }, 5000); // Verificar a cada 5 segundos

    return () => {
      window.removeEventListener('online', handleOnline);
      clearInterval(checkConnection);
    };
  }, [router]);

  return (
    <>
      <Head>
        <title>Offline - ProfNet</title>
      </Head>

      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-blue-600 mb-4">Sem conexão</h1>
          
          <p className="mb-6">
            Você está offline no momento. O aplicativo ProfNet requer uma conexão com a internet para funcionar corretamente.
          </p>
          
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-2">Sugestões:</p>
            <ul className="text-sm text-gray-600 text-left list-disc pl-5">
              <li>Verifique sua conexão de internet</li>
              <li>Ative os dados móveis ou Wi-Fi</li>
              <li>Verifique sua conexão de rede</li>
            </ul>
          </div>
          
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    </>
  );
}
