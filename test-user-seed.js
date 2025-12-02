import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("password123", 10);

  const users = [
    {
      username: "lisboa",
      email: "lisboa@test.com",
      password,
      nickname: "Lisboa Dev",
      bio: "Desenvolvedor do CollectionHub",
    },
    {
      username: "thiagoferreira",
      email: "thiago@test.com",
      password,
      nickname: "Thiago",
      bio: "Colecionador de cartas",
    },
    {
      username: "testuser",
      email: "test@test.com",
      password,
      nickname: "Test User",
      bio: "Usuário de teste",
    },
  ];

  for (const userData of users) {
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ username: userData.username }, { email: userData.email }],
      },
    });

    if (!existing) {
      const user = await prisma.user.create({
        data: userData,
      });
      console.log(`✅ Created user: ${user.username} (${user.email})`);
    } else {
      console.log(`⚠️  User ${userData.username} already exists`);
    }
  }

  console.log("\n✅ Test users seed completed!");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
