import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";
import { Telegraf } from "telegraf";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// ESM rejimi uchun yo'llarni aniqlash
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Root papkadagi .env faylini yuklash
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// 1. FIREBASE ADMIN SDK ULANISHI (serviceAccountKey.json faylidan o'qish)
let serviceAccount;

try {
  const serviceAccountPath = path.resolve(
    __dirname,
    "./serviceAccountKey.json"
  );
  serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));
} catch (err) {
  console.error(
    "❌ serviceAccountKey.json faylini o'qishda xatolik:",
    err.message
  );
  process.exit(1);
}

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

// 2. TELEGRAM BOT TOKEN ULANISHI
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!BOT_TOKEN) {
  console.error("❌ TELEGRAM_BOT_TOKEN .env faylida topilmadi!");
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

// Kanallar ro'yxati va ID/usernamelari (AvtoTek)
const MARKET_CHANNEL_ID = "@dataBaseForTheWatchOutlet"; // Bozor postlari kanali
const AUCTION_CHANNEL_ID = "@auctionForTheWatchOutlet"; // Auksion kanali
const INSTALLMENT_CHANNEL_ID = "@nasiyaForTheWatchOutlet"; // Nasiya savdo kanali

// Universal tozalash funksiyasi
async function cleanupCollection(collectionName, channelId) {
  console.log(`\n🧹 "${collectionName}" kolleksiyasini tozalash boshlandi...`);

  const snapshot = await db.collection(collectionName).get();

  if (snapshot.empty) {
    console.log(
      `ℹ️ "${collectionName}" ichida hech qanday ma'lumot topilmadi.`
    );
    return;
  }

  console.log(`📦 Jami topilgan e'lonlar soni: ${snapshot.size} ta`);

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const messageId = data.messageId;

    // Telegram kanaldan postni o'chirish
    if (messageId && channelId) {
      try {
        await bot.telegram.deleteMessage(channelId, messageId);
        console.log(
          `🗑️ Telegram post o'chirildi (${collectionName}, Message ID: ${messageId})`
        );
      } catch (tgErr) {
        console.log(
          `⚠️ ${collectionName} posti ${messageId} o'chirilmadi (balki allaqachon o'chirilgan):`,
          tgErr.message
        );
      }
    }

    // Firestore'dan hujjatni o'chirish
    await db.collection(collectionName).doc(doc.id).delete();
    console.log(`✅ Firestore'dan o'chirildi (${collectionName}): ${doc.id}`);
  }

  console.log(`🎉 "${collectionName}" kolleksiyasi to'liq tozalandi!`);
}

async function cleanupAllData() {
  try {
    // 1. Bozor mashinalari
    await cleanupCollection("cars", MARKET_CHANNEL_ID);

    // 2. Auksion mashinalari
    await cleanupCollection("auctions", AUCTION_CHANNEL_ID);

    // 3. Nasiya savdo mashinalari
    await cleanupCollection("installment_cars", INSTALLMENT_CHANNEL_ID);

    console.log(
      "\n🎉🎉 Barcha (bozor + auksion + nasiya) test ma'lumotlari muvaffaqiyatli o'chirildi!"
    );
  } catch (error) {
    console.error("❌ O'chirishda xatolik yuz berdi:", error);
  } finally {
    process.exit();
  }
}

cleanupAllData();
