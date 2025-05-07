// src/services/openai.ts
const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

type GenerateContentOptions = {
  prompt: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
};

export async function generateContent(options: GenerateContentOptions): Promise<string> {
  const { 
    prompt, 
    model = 'gpt-4.1', 
    maxTokens = 1500, 
    temperature = 0.7 
  } = options;
  
  try {
    console.log('Gerando conteúdo com OpenAI...');
    
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: 'Você é um assistente especializado em educação, com experiência de 30 anos em criar conteúdos pedagógicos detalhados e de alta qualidade para professores. Forneça respostas em formato markdown bem estruturado e detalhado.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: maxTokens,
        temperature: temperature,
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Erro ao comunicar com a API da OpenAI');
    }
    
    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Erro ao gerar conteúdo:', error);
    throw error;
  }
}
