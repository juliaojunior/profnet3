// src/services/imgur.ts
const IMGUR_CLIENT_ID = 'd93758b8cc72b76'; // Client ID identificado no arquivo de referência

export async function uploadImageToImgur(imageFile: File): Promise<string> {
  console.log('Iniciando upload para Imgur');
  
  try {
    // Criar FormData para o upload
    const formData = new FormData();
    formData.append('image', imageFile);
    
    // Fazer a requisição para a API do Imgur
    const response = await fetch('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: {
        Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
      },
      body: formData,
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.data.error || 'Falha ao fazer upload da imagem');
    }
    
    // Retornar a URL da imagem
    console.log('Upload concluído com sucesso:', data.data.link);
    return data.data.link;
  } catch (error) {
    console.error('Erro ao fazer upload para o Imgur:', error);
    throw error;
  }
}
