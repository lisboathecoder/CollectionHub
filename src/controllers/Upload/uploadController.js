import { uploadToImgBB } from "../../services/imgbbService.js";

export const uploadImagem = async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ erro: "Imagem não fornecida" });
    }

    const imageUrl = await uploadToImgBB(image);

    res.status(200).json({
      mensagem: "Upload realizado com sucesso",
      imageUrl: imageUrl
    });
  } catch (e) {
    res.status(500).json({
      erro: "Erro ao fazer upload",
      detalhes: e.message
    });
  }
};
