import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const encontreTodos = async () => {
  return await prisma.moeda.findMany({
    include: {
      country: true, 
    },
    orderBy: { nome: 'asc' }
  });
}

export const encontreUm = async (id) => {
  return await prisma.moeda.findUnique({
    where: { id: Number(id) },
    include: {
      country: true,
    }
  });
}

export const criar = async (dado) => {
  return await prisma.moeda.create({
    data: {
      nome: dado.nome,
      ano: Number(dado.ano), 
      material: dado.material,
      countryCode: dado.countryCode,
      valorFacial: dado.valorFacial,
      descricao: dado.descricao,
      peso_g: dado.peso_g ? Number(dado.peso_g) : null,
      imageNameAnverso: dado.imageNameAnverso,
      imageNameReverso: dado.imageNameReverso,
    }
  });
}

export const deletar = async (id) => {
  return await prisma.moeda.delete({
    where: { id: Number(id) }
  });
}

export const atualizar = async (id, dado) => {
  return await prisma.moeda.update({
    where: { id: Number(id) },
    data: {
      ...(dado.nome && { nome: dado.nome }),
      ...(dado.ano && { ano: Number(dado.ano) }),
      ...(dado.material && { material: dado.material }),
      ...(dado.countryCode && { countryCode: dado.countryCode }),
      ...(dado.valorFacial && { valorFacial: dado.valorFacial }),
      ...(dado.descricao && { descricao: dado.descricao }),
      ...(dado.peso_g && { peso_g: Number(dado.peso_g) }),
      ...(dado.imageNameAnverso && { imageNameAnverso: dado.imageNameAnverso }),
      ...(dado.imageNameReverso && { imageNameReverso: dado.imageNameReverso }),
    }
  });
}