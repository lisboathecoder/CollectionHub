import { PrismaClient } from '@prisma/client';
import fs from 'node:fs/promises';
import path from 'node:path';

const prisma = new PrismaClient();

const root = process.cwd();
const file = (p) => path.join(root, 'dist', p);

async function readJSON(p) {
  const buf = await fs.readFile(file(p), 'utf8');
  return JSON.parse(buf);
}

async function main() {
  const rarity = await readJSON('rarity.json'); 
  const sets = await readJSON('sets.json');     
  const cards = await readJSON('cards.json');   

  for (const [code, name] of Object.entries(rarity)) {
    await prisma.rarity.upsert({
      where: { code },
      update: { name },
      create: { code, name },
    });
  }

 
  for (const s of sets) {
    const code = s.code;
    const nameEn = s.label?.en ?? code;
    const releaseDate = s.releaseDate ? new Date(s.releaseDate) : null;
    const count = Number.isFinite(s.count) ? s.count : null;

    await prisma.set.upsert({
      where: { code },
      update: { nameEn, releaseDate, count },
      create: { code, nameEn, releaseDate, count },
    });


    for (const packName of (s.packs ?? [])) {
      await prisma.pack.upsert({
        where: { setCode_name: { setCode: code, name: packName } },
        update: {},
        create: { name: packName, setCode: code },
      });
    }
  }


  for (const c of cards) {
    if (!c.set || !Number.isFinite(c.number)) continue; 

    const data = {
      setCode: c.set,
      number: c.number,
      nameEn: c.label?.eng ?? null,
      slug: c.label?.slug ?? null,
      imageName: c.imageName ?? null,
      imageUrl: c.imageUrl ?? null,
      rarityCode: c.rarityCode ?? null,
    };


    const connects = (Array.isArray(c.packs) ? c.packs : [])
      .map((name) => ({ setCode_name: { setCode: c.set, name } }));

    await prisma.card.upsert({
      where: { setCode_number: { setCode: c.set, number: c.number } },
      update: {
        ...data,

        packs: { connect: connects },
      },
      create: {
        ...data,
        packs: { connect: connects },
      },
    });
  }

  console.log('Seed concluído.');
}



main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });