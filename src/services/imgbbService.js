export async function uploadToImgBB(base64Image) {
  const apiKey = process.env.IMGBB_API_KEY;
  
  if (!apiKey) {
    throw new Error('IMGBB_API_KEY não configurada no .env');
  }

  const formData = new FormData();
  formData.append('image', base64Image);

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    throw new Error('Erro ao fazer upload para ImgBB');
  }

  const data = await response.json();
  return data.data.url;
}
