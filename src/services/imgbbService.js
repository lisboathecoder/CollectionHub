export async function uploadToImgBB(base64Image) {
  const apiKey = process.env.IMGBB_API_KEY;

  if (!apiKey) {
    throw new Error("IMGBB_API_KEY não configurada no .env");
  }

  // Remove o prefixo data:image se presente
  const base64Data = base64Image.includes('base64,') 
    ? base64Image.split('base64,')[1] 
    : base64Image;

  const formData = new FormData();
  formData.append("image", base64Data);

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMsg = errorData.error?.message || errorData.error || `Erro ImgBB (${response.status})`;
    console.error('❌ Erro ImgBB:', errorMsg, errorData);
    throw new Error(errorMsg);
  }

  const data = await response.json();
  
  if (!data.success || !data.data?.url) {
    throw new Error("Resposta inválida do ImgBB");
  }
  
  return data.data.url;
}
