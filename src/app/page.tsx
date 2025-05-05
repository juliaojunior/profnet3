import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-background text-text">
      <h1 className="text-4xl font-bold text-primary mb-8">ProfNet</h1>
      <p className="text-xl mb-8">Plataforma para docentes compartilharem conhecimentos</p>
      
      <div className="space-y-4">
        <Link 
          href="/login" 
          className="block px-6 py-3 bg-primary hover:bg-primary-dark rounded-md text-center"
        >
          Entrar
        </Link>
        
        <Link
          href="/signup"
          className="block px-6 py-3 bg-background-light hover:bg-gray-700 rounded-md text-center"
        >
          Cadastrar
        </Link>
      </div>
    </div>
  );
}
