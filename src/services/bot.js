import { Telegraf } from "telegraf";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import http from "http";

// Firebase Admin SDK ni xavfsiz konfiguratsiya qilish
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : null;

if (!serviceAccount) {
  console.error("❌ Firebase Service Account kaliti topilmadi!");
  process.exit(1);
}

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

// Bot tokenni .env yoki muhit o'zgaruvchisidan olish
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!BOT_TOKEN) {
  console.error("❌ TELEGRAM_BOT_TOKEN topilmadi!");
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

// Post matnini pars (tahlil) qilish funksiyasi
function parseCarPost(text, messageId) {
  if (!text) return null;

  const lines = text.split("\n");
  const data = {
    messageId: messageId,
    updatedAt: new Date(),
  };

  let isAuction = false;
  let isInstallment = false;
  let type = "market";

  const images = [];

  lines.forEach((line) => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return;

    // Type ni aniqlash
    if (trimmedLine.toLowerCase().startsWith("type:")) {
      const typeValue = trimmedLine.split(":")[1].trim().toLowerCase();
      if (typeValue === "auction") {
        isAuction = true;
        type = "auction";
      } else if (typeValue === "installment") {
        isInstallment = true;
        type = "installment";
      } else {
        type = "market";
      }
    }

    if (trimmedLine.includes("🔥 AUKSION POSTI 🔥")) {
      isAuction = true;
      type = "auction";
    }

    if (trimmedLine.includes("🏦 NASIYA POSTI 🏦")) {
      isInstallment = true;
      type = "installment";
    }

    // Umumiy va Nasiya maydonlari
    if (trimmedLine.startsWith("ID:"))
      data.carId = trimmedLine.replace("ID:", "").trim();
    if (trimmedLine.startsWith("Holat:"))
      data.status = trimmedLine.replace("Holat:", "").trim();
    if (trimmedLine.startsWith("Nomi:"))
      data.name = trimmedLine.replace("Nomi:", "").trim();
    if (trimmedLine.startsWith("VIN:"))
      data.vin = trimmedLine.replace("VIN:", "").trim();

    // Narx va Nasiya hisob-kitoblari
    if (trimmedLine.startsWith("Narxi:"))
      data.price = Number(trimmedLine.replace(/[^0-9]/g, "")) || 0;
    if (trimmedLine.startsWith("Umumiy narx:"))
      data.totalPrice = Number(trimmedLine.replace(/[^0-9]/g, "")) || 0;
    if (trimmedLine.startsWith("Minimal boshlang'ich to'lov:"))
      data.minDownPayment = Number(trimmedLine.replace(/[^0-9]/g, "")) || 0;
    if (trimmedLine.startsWith("Yillik foiz:"))
      data.annualInterest = Number(trimmedLine.replace(/[^0-9]/g, "")) || 0;
    if (trimmedLine.startsWith("Minimal muddat:"))
      data.minPeriod = Number(trimmedLine.replace(/[^0-9]/g, "")) || 0;
    if (trimmedLine.startsWith("Maksimal muddat:"))
      data.maxPeriod = Number(trimmedLine.replace(/[^0-9]/g, "")) || 0;

    // Auksion maydonlari
    if (trimmedLine.startsWith("Boshlang'ich narx:")) {
      data.startingPrice = Number(trimmedLine.replace(/[^0-9]/g, "")) || 0;
      data.currentPrice = data.startingPrice;
    }
    if (trimmedLine.startsWith("Stavka qadami:"))
      data.bidStep = Number(trimmedLine.replace(/[^0-9]/g, "")) || 100;
    if (trimmedLine.startsWith("Tugash vaqti:"))
      data.endTime = trimmedLine.replace("Tugash vaqti:", "").trim();

    // Mashina xarakteristikalari
    if (trimmedLine.startsWith("Yili:"))
      data.year = trimmedLine.replace("Yili:", "").trim();
    if (trimmedLine.startsWith("Probeg:"))
      data.mileage = Number(trimmedLine.replace(/[^0-9]/g, "")) || 0;
    if (trimmedLine.startsWith("Korobka:"))
      data.gearbox = trimmedLine.replace("Korobka:", "").trim();
    if (trimmedLine.startsWith("Rangi:"))
      data.color = trimmedLine.replace("Rangi:", "").trim();
    if (trimmedLine.startsWith("Motor:"))
      data.engine = trimmedLine.replace("Motor:", "").trim();
    if (trimmedLine.startsWith("Yoqilgi:"))
      data.fuel = trimmedLine.replace("Yoqilgi:", "").trim();
    if (trimmedLine.startsWith("Joy:"))
      data.location = trimmedLine.replace("Joy:", "").trim();
    if (trimmedLine.startsWith("Sana:"))
      data.date = trimmedLine.replace("Sana:", "").trim();
    if (trimmedLine.startsWith("Instagram:"))
      data.instagram = trimmedLine.replace("Instagram:", "").trim();
    if (trimmedLine.startsWith("Youtube:"))
      data.youtube = trimmedLine.replace("Youtube:", "").trim();
    if (trimmedLine.startsWith("Tavsif:"))
      data.description = trimmedLine.replace("Tavsif:", "").trim();

    // Rasmlarni olish
    if (trimmedLine.match(/^Rasm\d+:/i)) {
      const urlMatches = trimmedLine.match(/https?:\/\/[^\s]+/);
      if (urlMatches && urlMatches[0]) {
        images.push(urlMatches[0]);
      }
    }
  });

  data.isAuction = isAuction;
  data.isInstallment = isInstallment;
  data.type = type;
  data.images = images;

  return data;
}

// BOT LISTENERI
bot.on(["message", "channel_post", "edited_channel_post"], async (ctx) => {
  try {
    const post = ctx.channelPost || ctx.editedChannelPost || ctx.message;
    const text = post.text || post.caption || "";

    // Text mavjud emasligini tekshirish
    if (!text || !text.trim()) return;

    const carData = parseCarPost(text, post.message_id);

    // Baza uchun validatsiya: Nomi va Narxlaridan biri ham bo'lmasa o'tkazib yuboriladi
    if (
      !carData ||
      (!carData.name &&
        !carData.price &&
        !carData.startingPrice &&
        !carData.totalPrice)
    ) {
      console.log(
        `⚠️ Bo'sh yoki avto ma'lumotiga ega bo'lmagan post e'tiborsiz qoldirildi (ID: ${post.message_id})`
      );
      return;
    }

    if (carData.isAuction) {
      await db
        .collection("auctions")
        .doc(`post_${post.message_id}`)
        .set(carData, { merge: true });
      console.log(`🔥 Auksion saqlandi: post_${post.message_id}`);
    } else if (carData.isInstallment) {
      await db
        .collection("installment_cars")
        .doc(`post_${post.message_id}`)
        .set(carData, { merge: true });
      console.log(`🏦 Nasiya mashina saqlandi: post_${post.message_id}`);
    } else {
      await db
        .collection("cars")
        .doc(`post_${post.message_id}`)
        .set(carData, { merge: true });
      console.log(`🚗 Oddiy mashina saqlandi: post_${post.message_id}`);
    }
  } catch (error) {
    console.error("❌ Firestore-ga yozishda xato:", error);
  }
});

// Render uchun soxta HTTP server (Port o'chib qolmasligi uchun)
const PORT = process.env.PORT || 10000;
http
  .createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("AvtoTek Bot active!");
  })
  .listen(PORT, () => {
    console.log(`🌐 Dummy HTTP server ${PORT}-portda ishlamoqda...`);
  });

// BOTNI ISHGA TUSHIRISH
bot.launch();
console.log("🤖 Bot ishga tushdi, postlarni kutmoqda...");

// Dastur to'xtaganda botni toza yopish
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));