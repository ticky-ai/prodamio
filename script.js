const leadForm = document.getElementById("leadForm");
const formMessage = document.getElementById("formMessage");
const year = document.getElementById("year");
const flyItems = document.querySelectorAll(".fly");
const flyContainer = document.querySelector(".bg-fly");
const tradeItems = document.querySelectorAll(".trade-item");
const totalEarned = document.getElementById("totalEarned");

if (year) {
  year.textContent = String(new Date().getFullYear());
}

if (leadForm) {
  leadForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(leadForm).entries());
    // Заглушка: здесь можно подключить Telegram Bot API, CRM, email-сервис или backend endpoint.
    console.log("Заявка:", payload);
    if (formMessage) {
      formMessage.textContent = "Спасибо, мы свяжемся с вами";
    }
    leadForm.reset();
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
