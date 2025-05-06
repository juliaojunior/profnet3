import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithRedirect, 
  signInWithPopup,
  getRedirectResult
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

console.log("Firebase config:", { 
  apiKey: firebaseConfig.apiKey?.substring(0, 5) + "...", 
  projectId: firebaseConfig.projectId 
});

// Inicializar Firebase apenas se ainda não foi inicializado
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Função de login com Google usando redirecionamento
export async function loginWithGoogle() {
  try {
    console.log('Tentando login com Google via redirecionamento...');
    const provider = new GoogleAuthProvider();
    
    // Adicionar escopos adicionais para melhorar a compatibilidade
    provider.addScope('profile');
    provider.addScope('email');
    
    // Configurar parâmetros personalizados
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    await signInWithRedirect(auth, provider);
    // Nota: Esta função redireciona para a página de login do Google,
    // então o código após esta linha não será executado imediatamente
    return null;
  } catch (error) {
    console.error('Erro ao redirecionar para login com Google:', error);
    throw error;
  }
}

// Função para obter o resultado do login com redirecionamento
export async function getGoogleRedirectResult() {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      console.log('Login com Google via redirecionamento bem-sucedido!');
      return result.user;
    }
    return null;
  } catch (error) {
    console.error('Erro ao processar resultado do login por redirecionamento:', error);
    throw error;
  }
}

export { app, auth, db, storage };
