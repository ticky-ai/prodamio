Да, конечно — вот полный script.js целиком, просто вставь как есть:


const leadForm = document.getElementById("leadForm");
const formMessage = document.getElementById("formMessage");
const year = document.getElementById("year");
const flyItems = document.querySelectorAll(".fly");
const flyContainer = document.querySelector(".bg-fly");
const tradeItems = document.querySelectorAll(".trade-item");
const totalEarned = document.getElementById("totalEarned");
const TELEGRAM_BOT_TOKEN = "8467579027:AAHQqefeSczbm2LVqPXp0WLOerhjVBlkiO0";
const TELEGRAM_CHAT_ID = "143145311";
function getAlternativeImageSrc(src) {
  if (!src) return "";
  if (src.includes("/assets/")) return src.replace("/assets/", "/");
  if (src.includes("./assets/")) return src.replace("./assets/", "./");
  if (src.startsWith("./")) return src.replace("./", "./assets/");
  if (src.startsWith("/")) return src.replace("/", "/assets/");
  return `./assets/${src}`;
}
function enableImageFallback() {
  const images = document.querySelectorAll("img");
  images.forEach((img) => {
    img.addEventListener("error", () => {
      const currentSrc = img.getAttribute("src");
      const triedSrc = img.dataset.fallbackSrc;
      const nextSrc = getAlternativeImageSrc(currentSrc || "");
      if (!nextSrc || nextSrc === currentSrc || triedSrc === nextSrc) return;
      img.dataset.fallbackSrc = nextSrc;
      img.src = nextSrc;
    });
  });
}
enableImageFallback();
if (year) {
  year.textContent = String(new Date().getFullYear());
}
if (leadForm) {
  leadForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(leadForm);
    const payload = Object.fromEntries(formData.entries());
    const photo = formData.get("photo");
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      if (formMessage) {
        formMessage.textContent = "Заполните TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID в script.js";
      }
      return;
    }
    if (formMessage) formMessage.textContent = "Отправляем заявку...";
    try {
      const text = [
        "Новая заявка с сайта",
        `Имя: ${payload.name || "-"}`,
        `Контакт: ${payload.contact || "-"}`,
      ].join("\n");
      if (photo instanceof File && photo.size > 0) {
        const telegramPhotoData = new FormData();
        telegramPhotoData.append("chat_id", TELEGRAM_CHAT_ID);
        telegramPhotoData.append("caption", text);
        telegramPhotoData.append("photo", photo, photo.name || "lead-photo.jpg");
        const photoResponse = await fetch(
          `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`,
          {
            method: "POST",
            body: telegramPhotoData,
          },
        );
        const photoResult = await photoResponse.json();
        if (!photoResult.ok) throw new Error(photoResult.description || "Ошибка отправки фото");
      } else {
        const messageResponse = await fetch(
          `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: TELEGRAM_CHAT_ID,
              text,
            }),
          },
        );
        const messageResult = await messageResponse.json();
        if (!messageResult.ok) throw new Error(messageResult.description || "Ошибка отправки сообщения");
      }
      if (formMessage) formMessage.textContent = "Спасибо, заявка отправлена";
      leadForm.reset();
    } catch (error) {
      console.error("Ошибка отправки заявки в Telegram:", error);
      if (formMessage) {
        formMessage.textContent = "Не удалось отправить заявку. Проверьте токен/чат и попробуйте снова.";
      }
    }
  });
}
function parseToMs(value) {
  if (!value) return 12000;
  const normalized = String(value).trim();
  if (normalized.endsWith("ms")) return Number.parseFloat(normalized);
  return Number.parseFloat(normalized) * 1000;
}
function animateMoneyTransform(element) {
  const itemIcon = element.dataset.item || "📦";
  const moneyIcon = element.dataset.money || "$";
  const duration = parseToMs(getComputedStyle(element).animationDuration);
  element.classList.remove("money");
  element.textContent = itemIcon;
  setTimeout(() => {
    element.textContent = moneyIcon;
    element.classList.add("money");
    if (flyContainer) {
      const rect = element.getBoundingClientRect();
      const burst = document.createElement("span");
      burst.className = "money-burst";
      burst.style.left = `${rect.left + rect.width / 2}px`;
      burst.style.top = `${rect.top + rect.height / 2}px`;
      flyContainer.appendChild(burst);
      setTimeout(() => burst.remove(), 450);
    }
  }, duration * 0.5);
}
flyItems.forEach((item) => {
  animateMoneyTransform(item);
  item.addEventListener("animationiteration", () => animateMoneyTransform(item));
});
tradeItems.forEach((item) => {
  item.addEventListener("click", () => {
    const isConverted = item.classList.contains("converted");
    const oldPop = item.querySelector(".ruble-pop");
    if (oldPop) oldPop.remove();
    if (isConverted) {
      item.classList.remove("converted");
      updateTotalEarned();
      return;
    }
    const amount = Number.parseInt(item.dataset.amount || "0", 10);
    const pop = document.createElement("span");
    pop.className = "ruble-pop";
    pop.textContent = `${amount.toLocaleString("ru-RU")} ₽`;
    item.appendChild(pop);
    item.classList.add("converted");
    updateTotalEarned();
  });
});
function updateTotalEarned() {
  if (!totalEarned) return;
  let sum = 0;
  tradeItems.forEach((item) => {
    if (item.classList.contains("converted")) {
      sum += Number.parseInt(item.dataset.amount || "0", 10);
    }
  });
  totalEarned.textContent = `${sum.toLocaleString("ru-RU")} ₽`;
}
