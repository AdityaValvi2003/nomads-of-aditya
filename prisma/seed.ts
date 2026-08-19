import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";


const connectionString = process.env.DIRECT_URL;

if (!connectionString) {
  throw new Error("DIRECT_URL is not defined in .env");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});
async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "ADMIN_EMAIL and ADMIN_PASSWORD must be defined in .env"
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const owner = await prisma.user.upsert({
    where: {
      email,
    },
    update: {
      name: "Aditya Valvi",
      passwordHash,
      role: "OWNER",
    },
    create: {
      name: "Aditya Valvi",
      email,
      passwordHash,
      role: "OWNER",
    },
  });

  await prisma.siteSettings.upsert({
    where: {
      id: "site-settings",
    },
    update: {
      siteName: "Nomads of Aditya",
      ownerName: "Aditya Valvi",
      defaultTheme: "dark",
      accentColor: "#D99A3D",
      heroHeadline:
        "Life is too short to live someone else's version of it.",
      heroSubheadline:
        "I'm still figuring life out. These are the places, people and moments helping me along the way.",
    },
    create: {
      id: "site-settings",
      siteName: "Nomads of Aditya",
      ownerName: "Aditya Valvi",
      defaultTheme: "dark",
      accentColor: "#D99A3D",
      heroHeadline:
        "Life is too short to live someone else's version of it.",
      heroSubheadline:
        "I'm still figuring life out. These are the places, people and moments helping me along the way.",
    },
  });

  console.log("Owner created:", owner.email);
  console.log("Site settings initialized.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });     