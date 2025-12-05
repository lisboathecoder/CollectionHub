import prisma from "../../lib/prisma.js";

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        nickname: true,
        bio: true,
        avatarUrl: true,
        coverUrl: true,
        location: true,
        createdAt: true,
        albums: {
          select: {
            id: true,
            name: true,
            isPublic: true,
            items: true,
          },
        },
      },
    });

    if (!user) {
      return res
        .status(404)
        .json({ error: "USER_NOT_FOUND", message: "Usuário não encontrado" });
    }

    const totalItems = user.albums.reduce(
      (sum, album) => sum + album.items.length,
      0
    );
    const totalAlbums = user.albums.length;

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      nickname: user.nickname || `@${user.username}`,
      bio: user.bio || "Sem biografia.",
      avatarUrl: user.avatarUrl || "/assets/images/icon.png",
      coverUrl: user.coverUrl,
      location: user.location || "Brasil",
      stats: {
        items: totalItems,
        sets: totalAlbums,
      },
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error("❌ Erro ao buscar perfil:", error);
    res
      .status(500)
      .json({ error: "INTERNAL_ERROR", message: "Erro ao buscar perfil" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, nickname, bio, location, avatarUrl, coverUrl } = req.body;

    console.log("📝 Atualizando perfil:", {
      userId,
      username,
      nickname,
      bio,
      location,
      avatarUrl,
      coverUrl,
    });

    const updateData = {};
    if (username !== undefined) updateData.username = username;
    if (nickname !== undefined) updateData.nickname = nickname;
    if (bio !== undefined) updateData.bio = bio;
    if (location !== undefined) updateData.location = location;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (coverUrl !== undefined) updateData.coverUrl = coverUrl;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        nickname: true,
        bio: true,
        avatarUrl: true,
        coverUrl: true,
        location: true,
      },
    });

    console.log("✅ Perfil atualizado:", updatedUser);

    res.json({
      message: "Perfil atualizado com sucesso",
      user: updatedUser,
    });
  } catch (error) {
    console.error("❌ Erro ao atualizar perfil:", error);
    res.status(500).json({
      error: "UPDATE_FAILED",
      message: "Erro ao atualizar perfil",
      details: error.message,
    });
  }
};

export const uploadImage = async (req, res) => {
  try {
    const { image, type } = req.body;

    if (!image) {
      return res
        .status(400)
        .json({ error: "IMAGE_MISSING", message: "Imagem não fornecida" });
    }

    const IMGBB_API_KEY = process.env.IMGBB_API_KEY;

    if (!IMGBB_API_KEY) {
      return res.status(500).json({
        error: "CONFIG_ERROR",
        message: "Serviço de upload não configurado",
      });
    }

    console.log(`📤 Iniciando upload de ${type || "imagem"}...`);

    const base64Image = image.replace(/^data:image\/\w+;base64,/, "");

    const formData = new URLSearchParams();
    formData.append("key", IMGBB_API_KEY);
    formData.append("image", base64Image);

    const response = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (data.success) {
      console.log(
        `✅ Upload de ${type || "imagem"} bem-sucedido:`,
        data.data.url
      );

      res.json({
        success: true,
        url: data.data.url,
        deleteUrl: data.data.delete_url,
      });
    } else {
      console.error("❌ Falha no upload para ImgBB:", data);
      res.status(500).json({
        error: "UPLOAD_FAILED",
        message: "Erro ao fazer upload da imagem",
      });
    }
  } catch (error) {
    console.error("❌ Erro ao fazer upload:", error);
    res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "Erro ao fazer upload da imagem",
      details: error.message,
    });
  }
};
