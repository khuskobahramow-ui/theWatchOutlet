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
function parseWatchPost(text, messageId) {
  if (!text) return null;

  const lines = text.split("\n");
  const data = {
    messageId: messageId,
    updatedAt: new Date(),
  };

  let isAuction = false;
  let isInstallment = false;
  let isUsed = false;
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
      } else if (typeValue === "used") {
        isUsed = true;
        type = "used";
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

    if (trimmedLine.includes("⌚ Б/У SOAT POSTI ⌚")) {
      isUsed = true;
      type = "used";
    }

    // Umumiy va Nasiya maydonlari
    if (trimmedLine.startsWith("ID:"))
      data.watchId = trimmedLine.replace("ID:", "").trim();
    if (trimmedLine.startsWith("Holat:"))
      data.status = trimmedLine.replace("Holat:", "").trim();
    if (trimmedLine.startsWith("Nomi:"))
      data.name = trimmedLine.replace("Nomi:", "").trim();

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

    // SOAT XARAKTERISTIKALARI
    if (trimmedLine.startsWith("Brend:"))
      data.brand = trimmedLine.replace("Brend:", "").trim();
    if (trimmedLine.startsWith("Model:"))
      data.model = trimmedLine.replace("Model:", "").trim();
    if (trimmedLine.startsWith("Yili:"))
      data.year = trimmedLine.replace("Yili:", "").trim();
    if (trimmedLine.startsWith("Mexanizm:"))
      data.mechanism = trimmedLine.replace("Mexanizm:", "").trim();
    if (trimmedLine.startsWith("Diametr:"))
      data.diameter = trimmedLine.replace("Diametr:", "").trim();
    if (trimmedLine.startsWith("Korpus:"))
      data.caseMaterial = trimmedLine.replace("Korpus:", "").trim();
    if (trimmedLine.startsWith("Kamar:"))
      data.strap = trimmedLine.replace("Kamar:", "").trim();
    if (trimmedLine.startsWith("Suvdan himoya:"))
      data.waterResistance = trimmedLine.replace("Suvdan himoya:", "").trim();
    if (trimmedLine.startsWith("Shisha:"))
      data.glass = trimmedLine.replace("Shisha:", "").trim();
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
  data.isUsed = isUsed;
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

    const watchData = parseWatchPost(text, post.message_id);

    // Baza uchun validatsiya
    if (
      !watchData ||
      (!watchData.name &&
        !watchData.price &&
        !watchData.startingPrice &&
        !watchData.totalPrice)
    ) {
      console.log(
        `⚠️ Bo'sh yoki soat ma'lumotiga ega bo'lmagan post e'tiborsiz qoldirildi (ID: ${post.message_id})`
      );
      return;
    }

    if (watchData.isAuction) {
      await db
        .collection("auctions")
        .doc(`post_${post.message_id}`)
        .set(watchData, { merge: true });
      console.log(`🔥 Auksion soat saqlandi: post_${post.message_id}`);
    } else if (watchData.isInstallment) {
      await db
        .collection("installment_watches")
        .doc(`post_${post.message_id}`)
        .set(watchData, { merge: true });
      console.log(`🏦 Nasiya soat saqlandi: post_${post.message_id}`);
    } else if (watchData.isUsed) {
      await db
        .collection("used_watches")
        .doc(`post_${post.message_id}`)
        .set(watchData, { merge: true });
      console.log(`⌚ Б/У soat saqlandi: post_${post.message_id}`);
    } else {
      await db
        .collection("watches")
        .doc(`post_${post.message_id}`)
        .set(watchData, { merge: true });
      console.log(`⌚ Oddiy (Yangi) soat saqlandi: post_${post.message_id}`);
    }
  } catch (error) {
    console.error("❌ Firestore-ga yozishda xato:", error);
  }
});

// Render uchun soxta HTTP server
const PORT = process.env.PORT || 10000;
http
  .createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("The Watch Outlet Bot active!");
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
