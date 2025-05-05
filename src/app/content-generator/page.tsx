'use client';

import AppLayout from '@/components/layout/AppLayout';
import { useState } from 'react';

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
    
    // Aqui você implementaria a chamada para a API da OpenAI
    // Por enquanto, simulamos com um timeout
    setTimeout(() => {
      let content = '';
      
      switch (contentType) {
        case 'plano-aula':
          content = `# Plano de Aula: ${formData.temaAula}

**Disciplina:** ${formData.disciplina}
**Série/Ano:** ${formData.serieAno}
**Duração:** ${formData.duracao}

## Objetivos
${formData.objetivos}

## Conteúdo Programático
1. Introdução ao tema
2. Desenvolvimento dos conceitos principais
3. Atividades práticas
4. Avaliação da aprendizagem

## Recursos Necessários
${formData.recursos}

## Metodologia
- Aula expositiva dialogada
- Atividades em grupo
- Exercícios individuais

## Avaliação
- Participação nas atividades
- Resolução dos exercícios propostos
`;
          break;
          
        case 'plano-curso':
          content = `# Plano de Curso: ${formData.disciplina}

**Disciplina:** ${formData.disciplina}
**Série/Ano:** ${formData.serieAno}
**Carga Horária:** ${formData.cargaHoraria}

## Ementa
${formData.ementa}

## Objetivos Gerais
${formData.objetivosGerais}

## Unidades de Ensino
1. Unidade I - Introdução
2. Unidade II - Conceitos Fundamentais
3. Unidade III - Aplicações Práticas
4. Unidade IV - Avaliação e Projetos

## Metodologia
- Aulas expositivas
- Seminários
- Atividades práticas
- Projetos interdisciplinares

## Avaliação
- Provas escritas
- Trabalhos em grupo
- Apresentações
- Projeto final
`;
          break;
          
        case 'lista-exercicios':
          content = `# Lista de Exercícios: ${formData.conteudo}

**Disciplina:** ${formData.disciplina}
**Série/Ano:** ${formData.serieAno}
**Nível de Dificuldade:** ${formData.nivelDificuldade}

## Exercícios

1. Lorem ipsum dolor sit amet, consectetur adipiscing elit?
   a) Opção 1
   b) Opção 2
   c) Opção 3
   d) Opção 4

2. Suspendisse potenti. Nulla facilisi. Etiam bibendum justo eget odio semper?
   a) Alternativa A
   b) Alternativa B
   c) Alternativa C
   d) Alternativa D

3. Mauris vehicula, eros a tempor tincidunt, velit odio feugiat nunc?
   a) Resposta 1
   b) Resposta 2
   c) Resposta 3
   d) Resposta 4

4. Cras ultricies ligula sed magna dictum porta?
   a) Opção A
   b) Opção B
   c) Opção C
   d) Opção D

5. Vestibulum ac diam sit amet quam vehicula elementum sed sit amet dui?
   a) Alternativa 1
   b) Alternativa 2
   c) Alternativa 3
   d) Alternativa 4
`;
          break;
          
        case 'projeto-pedagogico':
          content = `# Projeto Pedagógico: ${formData.tituloProjeto}

**Título:** ${formData.tituloProjeto}
**Público-Alvo:** ${formData.publicoAlvo}
**Duração:** ${formData.duracaoProjeto}

## Objetivos
${formData.objetivosProjeto}

## Justificativa
Este projeto se justifica pela necessidade de proporcionar aos alunos uma experiência significativa de aprendizagem, conectando os conteúdos teóricos com a prática.

## Metodologia
${formData.metodologia}

## Recursos Necessários
${formData.recursosProjeto}

## Cronograma
1. Primeira semana: Apresentação do projeto e formação dos grupos
2. Segunda semana: Pesquisa e coleta de dados
3. Terceira semana: Desenvolvimento das atividades
4. Quarta semana: Finalização e apresentação dos resultados

## Avaliação
- Participação individual
- Trabalho em equipe
- Qualidade dos materiais produzidos
- Apresentação final
`;
          break;
      }
      
      setGeneratedContent(content);
      setGenerating(false);
    }, 2000);
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
