import { prisma } from "../../lib/prisma.js";

// Get user profile
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
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    // Calculate stats
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
    res.status(500).json({ error: "Erro ao buscar perfil" });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { nickname, bio, location, avatarUrl, coverUrl } = req.body;

    console.log('📝 Atualizando perfil:', { userId, nickname, bio, location, avatarUrl, coverUrl });

    // Build update data object with only defined values
    const updateData = {};
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

    console.log('✅ Perfil atualizado:', updatedUser);

    res.json({
      message: "Perfil atualizado com sucesso",
      user: updatedUser,
    });
  } catch (error) {
    console.error("❌ Erro ao atualizar perfil:", error);
    res.status(500).json({ error: "Erro ao atualizar perfil", details: error.message });
  }
};

// Upload image to ImgBB
export const uploadImage = async (req, res) => {
  try {
    const { image, type } = req.body; // type: 'avatar' or 'cover'

    if (!image) {
      return res.status(400).json({ error: "Imagem não fornecida" });
    }

    const IMGBB_API_KEY = process.env.IMGBB_API_KEY;

    if (!IMGBB_API_KEY) {
      return res.status(500).json({ error: "API Key do ImgBB não configurada" });
    }

    // Client handles resizing before sending (400x400 for avatar, 1500x500 for cover)
    // Remove data URI prefix if present
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
      res.json({
        success: true,
        url: data.data.url,
        deleteUrl: data.data.delete_url,
      });
    } else {
      res.status(500).json({ error: "Erro ao fazer upload da imagem" });
    }
  } catch (error) {
    console.error("❌ Erro ao fazer upload:", error);
    res.status(500).json({ error: "Erro ao fazer upload da imagem" });
  }
};
