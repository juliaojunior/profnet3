'use client';

import AppLayout from '@/components/layout/AppLayout';
import { useState } from 'react';
import { generateContent } from '@/services/openai';

type ContentType = 'plano-aula' | 'plano-curso' | 'lista-exercicios' | 'projeto-pedagogico';

export default function ContentGenerator() {
  const [contentType, setContentType] = useState<ContentType | ''>('');
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [formData, setFormData] = useState({
    // Campos compartilhados
    disciplina: '',
    serieAno: '',
    
    // Plano de aula
    temaAula: '',
    duracao: '',
    objetivos: '',
    recursos: '',
    
    // Plano de curso
    cargaHoraria: '',
    ementa: '',
    objetivosGerais: '',
    
    // Lista de exercícios
    conteudo: '',
    numQuestoes: '',
    nivelDificuldade: '',
    
    // Projeto pedagógico
    tituloProjeto: '',
    publicoAlvo: '',
    duracaoProjeto: '',
    objetivosProjeto: '',
    recursosProjeto: '',
    metodologia: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };


  const handleGenerateContent = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!contentType) return;
  
    setGenerating(true);
    setGeneratedContent('');
  
    try {
      let prompt = '';
    
      // Construir o prompt de acordo com o tipo de conteúdo
      switch (contentType) {
        case 'plano-aula':
          prompt = `Crie um plano de aula completo em markdown com o seguinte formato:
            Disciplina: ${formData.disciplina}
            Série/Ano: ${formData.serieAno}
            Tema da Aula: ${formData.temaAula}
            Duração: ${formData.duracao}
            Objetivos: ${formData.objetivos}
            Recursos Necessários: ${formData.recursos}
            
            O plano deve incluir:
            1. Título e informações básicas
            2. Objetivos de aprendizagem claros
            3. Conteúdo programático detalhado
            4. Metodologia de ensino
            5. Recursos necessários
            6. Desenvolvimento da aula (introdução, desenvolvimento e conclusão)
            7. Avaliação da aprendizagem
            8. Possíveis adaptações para alunos com necessidades especiais`;
          break;
          
        case 'plano-curso':
          prompt = `Elabore um plano de curso completo em markdown com o seguinte formato:
            Disciplina: ${formData.disciplina}
            Série/Ano: ${formData.serieAno}
            Carga Horária Total: ${formData.cargaHoraria}
            Ementa: ${formData.ementa}
            Objetivos Gerais: ${formData.objetivosGerais}
          
            O plano deve incluir:
            1. Título e identificação da disciplina
            2. Ementa completa
            3. Objetivos gerais e específicos
            4. Unidades de ensino detalhadas
            5. Conteúdo programático organizado por unidades
            6. Metodologia de ensino
            7. Critérios de avaliação
            8. Cronograma sugerido
            9. Bibliografia básica e complementar`;
          break;
        
        case 'lista-exercicios':
          prompt = `Crie uma lista de exercícios completa em markdown com o seguinte formato:
            Disciplina: ${formData.disciplina}
            Série/Ano: ${formData.serieAno}
            Conteúdo: ${formData.conteudo}
            Número de Questões: ${formData.numQuestoes}
            Nível de Dificuldade: ${formData.nivelDificuldade}
          
            A lista deve incluir:
            1. Título e identificação da atividade
            2. Instruções para os alunos
            3. ${formData.numQuestoes} questões variadas sobre ${formData.conteudo}
            4. Mistura de questões de múltipla escolha e discursivas
            5. Gabarito com as respostas corretas ao final
          
            Lembre-se que o nível é ${formData.nivelDificuldade}, então adapte a complexidade das questões de acordo.`;
          break;
        
        case 'projeto-pedagogico':
          prompt = `Desenvolva um projeto pedagógico completo em markdown com o seguinte formato:
            Título do Projeto: ${formData.tituloProjeto}
            Público-Alvo: ${formData.publicoAlvo}
            Duração: ${formData.duracaoProjeto}
            Objetivos: ${formData.objetivosProjeto}
            Recursos Necessários: ${formData.recursosProjeto}
            Metodologia: ${formData.metodologia}
          
            O projeto deve incluir:
            1. Título e resumo do projeto
            2. Justificativa da relevância
            3. Objetivos gerais e específicos
            4. Público-alvo detalhado
            5. Metodologia de trabalho
            6. Recursos necessários
            7. Cronograma detalhado de atividades
            8. Formas de avaliação
            9. Resultados esperados
            10. Referências`;
          break;
      }


   // Chamar a API da OpenAI
      const content = await generateContent({
        prompt,
        maxTokens: 2000, // Aumentado para conteúdos mais detalhados
        temperature: 0.7, // Equilíbrio entre criatividade e precisão
      });
    
      setGeneratedContent(content);
    } catch (error: any) {
      console.error('Erro na geração de conteúdo:', error);
      alert(`Erro ao gerar conteúdo: ${error.message}`);
    } finally {
      setGenerating(false);
    }
  };


  return (
    <AppLayout>
      <div>
        <h1 className="text-2xl font-bold text-text mb-6">Geração de Conteúdo</h1>
        
        <div className="card mb-6">
          <h2 className="text-xl text-text mb-4">Selecione o tipo de conteúdo</h2>
          
          <div className="mb-6">
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value as ContentType)}
              className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-text focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Selecione um tipo</option>
              <option value="plano-aula">Plano de Aula</option>
              <option value="plano-curso">Plano de Curso</option>
              <option value="lista-exercicios">Lista de Exercícios</option>
              <option value="projeto-pedagogico">Projeto Pedagógico</option>
            </select>
          </div>
          
          {contentType && (
            <form onSubmit={handleGenerateContent}>
              {/* Campos comuns para todos os tipos */}
              {(contentType === 'plano-aula' || contentType === 'plano-curso' || contentType === 'lista-exercicios') && (
                <>
                  <div className="mb-4">
                    <label htmlFor="disciplina" className="block text-sm text-text-muted mb-1">
                      Disciplina
                    </label>
                    <input
                      id="disciplina"
                      name="disciplina"
                      type="text"
                      value={formData.disciplina}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-text focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="serieAno" className="block text-sm text-text-muted mb-1">
                      Série/Ano
                    </label>
                    <input
                      id="serieAno"
                      name="serieAno"
                      type="text"
                      value={formData.serieAno}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-text focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                </>
              )}
              
              {/* Campos específicos para Plano de Aula */}
              {contentType === 'plano-aula' && (
                <>
                  <div className="mb-4">
                    <label htmlFor="temaAula" className="block text-sm text-text-muted mb-1">
                      Tema da Aula
                    </label>
                    <input
                      id="temaAula"
                      name="temaAula"
                      type="text"
                      value={formData.temaAula}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-text focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="duracao" className="block text-sm text-text-muted mb-1">
                      Duração
                    </label>
                    <input
                      id="duracao"
                      name="duracao"
                      type="text"
                      value={formData.duracao}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-text focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Ex: 50 minutos, 2 aulas, etc."
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="objetivos" className="block text-sm text-text-muted mb-1">
                      Objetivos
                    </label>
                    <textarea
                      id="objetivos"
                      name="objetivos"
                      value={formData.objetivos}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-text focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      rows={3}
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="recursos" className="block text-sm text-text-muted mb-1">
                      Recursos Necessários
                    </label>
                    <textarea
                      id="recursos"
                      name="recursos"
                      value={formData.recursos}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-text focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      rows={2}
                      required
                    />
                  </div>
                </>
              )}
              
              {/* Campos específicos para Plano de Curso */}
              {contentType === 'plano-curso' && (
                <>
                  <div className="mb-4">
                    <label htmlFor="cargaHoraria" className="block text-sm text-text-muted mb-1">
                      Carga Horária Total
                    </label>
                    <input
                      id="cargaHoraria"
                      name="cargaHoraria"
                      type="text"
                      value={formData.cargaHoraria}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-text focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Ex: 60 horas, 80 horas, etc."
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="ementa" className="block text-sm text-text-muted mb-1">
                      Ementa
                    </label>
                    <textarea
                      id="ementa"
                      name="ementa"
                      value={formData.ementa}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-text focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      rows={3}
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="objetivosGerais" className="block text-sm text-text-muted mb-1">
                      Objetivos Gerais
                    </label>
                    <textarea
                      id="objetivosGerais"
                      name="objetivosGerais"
                      value={formData.objetivosGerais}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-text focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      rows={3}
                      required
                    />
                  </div>
                </>
              )}
              
              {/* Campos específicos para Lista de Exercícios */}
              {contentType === 'lista-exercicios' && (
                <>
                  <div className="mb-4">
                    <label htmlFor="conteudo" className="block text-sm text-text-muted mb-1">
                      Conteúdo
                    </label>
                    <input
                      id="conteudo"
                      name="conteudo"
                      type="text"
                      value={formData.conteudo}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-text focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Ex: Trigonometria, Gramática, etc."
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="numQuestoes" className="block text-sm text-text-muted mb-1">
                      Número de Questões
                    </label>
                    <input
                      id="numQuestoes"
                      name="numQuestoes"
                      type="number"
                      min="1"
                      max="20"
                      value={formData.numQuestoes}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-text focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="nivelDificuldade" className="block text-sm text-text-muted mb-1">
                      Nível de Dificuldade
                    </label>
                    <select
                      id="nivelDificuldade"
                      name="nivelDificuldade"
                      value={formData.nivelDificuldade}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-text focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    >
                      <option value="">Selecione um nível</option>
                      <option value="Fácil">Fácil</option>
                      <option value="Médio">Médio</option>
                      <option value="Difícil">Difícil</option>
                      <option value="Misto">Misto</option>
                    </select>
                  </div>
                </>
              )}
              
              {/* Campos específicos para Projeto Pedagógico */}
              {contentType === 'projeto-pedagogico' && (
                <>
                  <div className="mb-4">
                    <label htmlFor="tituloProjeto" className="block text-sm text-text-muted mb-1">
                      Título do Projeto
                    </label>
                    <input
                      id="tituloProjeto"
                      name="tituloProjeto"
                      type="text"
                      value={formData.tituloProjeto}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-text focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="publicoAlvo" className="block text-sm text-text-muted mb-1">
                      Público-Alvo
                    </label>
                    <input
                      id="publicoAlvo"
                      name="publicoAlvo"
                      type="text"
                      value={formData.publicoAlvo}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-text focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Ex: 9º ano do Ensino Fundamental, 3º ano do Ensino Médio, etc."
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="duracaoProjeto" className="block text-sm text-text-muted mb-1">
                      Duração
                    </label>
                    <input
                      id="duracaoProjeto"
                      name="duracaoProjeto"
                      type="text"
                      value={formData.duracaoProjeto}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-text focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Ex: 1 mês, 1 bimestre, etc."
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="objetivosProjeto" className="block text-sm text-text-muted mb-1">
                      Objetivos
                    </label>
                    <textarea
                      id="objetivosProjeto"
                      name="objetivosProjeto"
                      value={formData.objetivosProjeto}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-text focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      rows={3}
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="recursosProjeto" className="block text-sm text-text-muted mb-1">
                      Recursos Necessários
                    </label>
                    <textarea
                      id="recursosProjeto"
                      name="recursosProjeto"
                      value={formData.recursosProjeto}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-text focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      rows={2}
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="metodologia" className="block text-sm text-text-muted mb-1">
                      Metodologia
                    </label>
                    <textarea
                      id="metodologia"
                      name="metodologia"
                      value={formData.metodologia}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-text focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      rows={3}
                      required
                    />
                  </div>
                </>
              )}
              
              <div>
                <button
                  type="submit"
                  disabled={generating}
                  className="px-4 py-2 bg-primary hover:bg-primary-dark rounded-md text-white font-bold transition-colors disabled:opacity-50"
                >
                  {generating ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Gerando...
                    </span>
                  ) : 'Gerar Conteúdo'}
                </button>
              </div>
            </form>
          )}
        </div>
        
        {generatedContent && (
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl text-text">Conteúdo Gerado</h2>
              <button 
                onClick={() => {
                  // Aqui você implementaria a lógica para baixar o conteúdo
                  const blob = new Blob([generatedContent], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${contentType}-${new Date().toISOString().split('T')[0]}.md`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                }}
                className="text-sm px-3 py-1 bg-background border border-gray-700 rounded-md text-text-muted hover:text-text"
              >
                Baixar
              </button>
            </div>
            <div className="bg-background p-4 rounded-md whitespace-pre-wrap font-mono text-sm text-text overflow-auto max-h-96">
              {generatedContent}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
