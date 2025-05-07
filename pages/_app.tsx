import { useEffect } from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import '../src/app/globals.css';


export default function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Registro do service worker
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator
    ) {
      // Adicione aqui qualquer lógica de inicialização do PWA se necessário
      console.log('PWA foi inicializado com sucesso!');
    }
  }, []);

  return (
    <>
      <Head>
        <title>ProfNet - Rede de Professores</title>
        <meta name="description" content="Aplicativo para uso por docentes na gestão de atividades pedagógicas" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
