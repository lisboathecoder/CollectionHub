import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "troque_isto_para_producao";

export const verificarToken = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '') || 
                req.cookies?.token;

  if (!token) {
    return res.status(401).json({ 
      erro: "Token não fornecido",
      mensagem: "Você precisa estar autenticado" 
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Map sub to id for consistency
    req.user = {
      id: decoded.sub,
      username: decoded.username,
      ...decoded
    };
    next();
  } catch (error) {
    return res.status(401).json({ 
      erro: "Token inválido",
      mensagem: "Faça login novamente" 
    });
  }
};

export const verificarProprietario = async (req, res, next) => {
  const userId = req.user.sub;
  const resourceUserId = parseInt(req.params.userId || req.body.userId);

  if (userId !== resourceUserId) {
    return res.status(403).json({ 
      erro: "Acesso negado",
      mensagem: "Você não tem permissão para acessar este recurso" 
    });
  }

  next();
};

// Alias for compatibility
export const authenticateToken = verificarToken;
