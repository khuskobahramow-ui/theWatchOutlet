import axios from "axios";

const CHANNEL_USERNAME = "DataBaseForAvtoTek";
const PROXY_TIMEOUT = 20000;
const NOT_PROVIDED = "";

export const fetchCarsFromTelegram = async () => {
  try {
    const targetUrl = `https://t.me/s/${CHANNEL_USERNAME}`;

    const proxies = [
      `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`,
      `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`,
      `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(
        targetUrl
      )}`,
    ];

    let htmlText = "";

    async function tryProxy(proxyUrl) {
      console.log("Telegram proxy tekshirilmoqda:", proxyUrl);

      const response = await axios.get(proxyUrl, {
        timeout: PROXY_TIMEOUT,
      });

      let data = response.data;

      if (data && typeof data === "object" && data.contents) {
        data = data.contents;
      }

      if (typeof data === "string" && data.includes("tgme_widget_message")) {
        console.log("Telegram HTML muvaffaqiyatli olindi:", proxyUrl);
        return data;
      }

      throw new Error("Proksi noto'g'ri formatda javob berdi: " + proxyUrl);
    }

    try {
      htmlText = await Promise.any(proxies.map((url) => tryProxy(url)));
    } catch (aggregateError) {
      console.warn(
        "Uchala proksi ham ishlamadi:",
        aggregateError?.errors || aggregateError
      );
    }

    if (!htmlText) {
      console.error("Telegram kanalidan HTML olinmadi.");
      return [];
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, "text/html");
    const messages = doc.querySelectorAll(".tgme_widget_message");

    console.log("Telegram postlari soni:", messages.length);

    const parsedCars = [];

    messages.forEach((msg, index) => {
      const textNode = msg.querySelector(".tgme_widget_message_text");

      if (!textNode) {
        return;
      }

      let name = "";
      let carId = "";
      let vin = "";
      let price = 0;
      let year = 2024;
      let mileage = 0;
      let location = "Toshkent sh.";
      let date = "Bugun";
      let status = "active"; // Sukut bo'yicha faol

      let gearbox = NOT_PROVIDED;
      let color = NOT_PROVIDED;
      let engine = NOT_PROVIDED;
      let fuel = NOT_PROVIDED;

      let instagram = NOT_PROVIDED;
      let youtube = NOT_PROVIDED;
      let description = NOT_PROVIDED;

      const images = [];

      const anchors = textNode.querySelectorAll("a");
      const anchorImageUrls = [];

      for (const anchor of anchors) {
        const href = anchor.getAttribute("href") || "";
        const isImage =
          href.includes("ibb.co") ||
          /\.(webp|jpg|jpeg|png)(\?.*)?$/i.test(href);

        if (isImage) {
          anchorImageUrls.push(href);
        }
      }

      let formattedHtml = textNode.innerHTML
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/div>/gi, "\n")
        .replace(/<div>/gi, "");

      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = formattedHtml;

      const text = tempDiv.innerText || tempDiv.textContent || "";

      const lines = text
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

      lines.forEach((line) => {
        const cleanLine = line.trim();
        if (!cleanLine) return;

        const lowerLine = cleanLine.toLowerCase();

        // -----------------------------------------------------
        // HOLAT / STATUS TEKSHIRUVI
        // -----------------------------------------------------
        if (lowerLine.startsWith("holat:") || lowerLine.startsWith("status:")) {
          const val = cleanLine
            .substring(cleanLine.indexOf(":") + 1)
            .trim()
            .toLowerCase();
          if (
            val === "no-active" ||
            val === "noactive" ||
            val === "sotildi" ||
            val === "inactive"
          ) {
            status = "no-active";
          }
        }

        // ID
        else if (lowerLine.startsWith("id:")) {
          carId = cleanLine.replace(/^id:/i, "").trim();
        }
        // NOMI
        else if (lowerLine.startsWith("nomi:")) {
          name = cleanLine.replace(/^nomi:/i, "").trim();
        }
        // VIN
        else if (lowerLine.startsWith("vin:")) {
          vin = cleanLine.replace(/^vin:/i, "").trim();
        }
        // NARXI
        else if (lowerLine.startsWith("narxi:")) {
          const value = cleanLine.replace(/^narxi:/i, "").replace(/[^\d]/g, "");
          price = value ? parseInt(value, 10) : 0;
        }
        // YILI
        else if (lowerLine.startsWith("yili:")) {
          const value = cleanLine.replace(/^yili:/i, "").replace(/[^\d]/g, "");
          year = value ? parseInt(value, 10) : 2024;
        }
        // PROBEG
        else if (lowerLine.startsWith("probeg:")) {
          const value = cleanLine
            .replace(/^probeg:/i, "")
            .replace(/[^\d]/g, "");
          mileage = value ? parseInt(value, 10) : 0;
        }
        // KOROBKA
        else if (lowerLine.startsWith("korobka:")) {
          gearbox = cleanLine.replace(/^korobka:/i, "").trim();
        }
        // RANGI
        else if (lowerLine.startsWith("rangi:")) {
          color = cleanLine.replace(/^rangi:/i, "").trim();
        }
        // MOTOR
        else if (lowerLine.startsWith("motor:")) {
          engine = cleanLine.replace(/^motor:/i, "").trim();
        }
        // YOQILG'I
        else if (
          lowerLine.startsWith("yoqilgi:") ||
          lowerLine.startsWith("yoqilg'i:")
        ) {
          fuel = cleanLine.replace(/^yoqilg'?i:/i, "").trim();
        }
        // JOY
        else if (lowerLine.startsWith("joy:")) {
          location = cleanLine.replace(/^joy:/i, "").trim();
        }
        // SANA
        else if (lowerLine.startsWith("sana:")) {
          date = cleanLine.replace(/^sana:/i, "").trim();
        }
        // INSTAGRAM
        else if (lowerLine.startsWith("instagram:")) {
          instagram = cleanLine.replace(/^instagram:/i, "").trim();
        }
        // YOUTUBE
        else if (lowerLine.startsWith("youtube:")) {
          youtube = cleanLine.replace(/^youtube:/i, "").trim();
        }
        // TAVSIF
        else if (lowerLine.startsWith("tavsif:")) {
          description = cleanLine.replace(/^tavsif:/i, "").trim();
        }
        // RASMLAR
        else if (/^rasm\d*:/i.test(lowerLine)) {
          let extractedUrl = cleanLine.replace(/^rasm\d*:/i, "").trim();
          extractedUrl = extractedUrl.replace(/[),.]+$/, "");

          if (
            extractedUrl.startsWith("http://") ||
            extractedUrl.startsWith("https://")
          ) {
            images.push(extractedUrl);
          }
        }
      });

      if (images.length === 0 && anchorImageUrls.length > 0) {
        images.push(...anchorImageUrls);
      }

      if (images.length === 0) {
        const photoNode = msg.querySelector(".tgme_widget_message_photo_wrap");
        if (photoNode) {
          const style = photoNode.getAttribute("style") || "";
          const urlMatch = style.match(/url\(['"]?(.*?)['"]?\)/);
          if (urlMatch && urlMatch[1]) {
            images.push(urlMatch[1]);
          }
        }
      }

      // FAQUAT 'no-active' BO'LMAGAN MAKNASHINALARNI QO'SHISH
      if (name && status !== "no-active") {
        const car = {
          id: carId || `${index}-${name}`,
          listingId: carId || "",
          vin,
          name,
          price,
          year,
          mileage,
          location,
          date,
          status,
          gearbox,
          color,
          engine,
          fuel,
          instagram,
          youtube,
          description,
          images,
          image: images[0] || "",
        };

        parsedCars.push(car);
      }
    });

    parsedCars.reverse();
    return parsedCars;
  } catch (error) {
    console.error("Telegramdan ma'lumot olishda xatolik:", error);
    return [];
  }
};
