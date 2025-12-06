import { uploadToImgBB } from "../../services/imgbbService.js";

export const uploadImagem = async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: "Imagem não fornecida" });
    }

    const imageUrl = await uploadToImgBB(image);

    res.status(200).json({
      message: "Upload realizado com sucesso",
      imageUrl: imageUrl,
    });
  } catch (e) {
    console.error('❌ Erro no upload:', e.message);
    res.status(500).json({
      error: "Erro ao fazer upload da imagem",
      details: e.message,
      message: e.message,
    });
  }
};
