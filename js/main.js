(() => {
  "use strict";

  const CONTACTS = {
    whatsapp: "",
    instagram: ""
  };

  const year = document.querySelector("[data-current-year]");
  if (year) year.textContent = String(new Date().getFullYear());

  const menuButton = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".site-nav");
  if (menuButton && navigation) {
    const updateCurrentNavigation = () => {
      const currentHash = window.location.hash || "#inicio";
      navigation.querySelectorAll("a[href^='#']").forEach((link) => {
        if (link.classList.contains("button")) return;
        if (link.getAttribute("href") === currentHash) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
      });
    };

    const closeMenu = () => {
      menuButton.setAttribute("aria-expanded", "false");
      navigation.classList.remove("is-open");
      menuButton.querySelector(".sr-only").textContent = "Abrir menu";
    };

    menuButton.addEventListener("click", () => {
      const isOpen = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!isOpen));
      navigation.classList.toggle("is-open", !isOpen);
      menuButton.querySelector(".sr-only").textContent = isOpen ? "Abrir menu" : "Fechar menu";
    });

    navigation.addEventListener("click", (event) => {
      if (event.target.closest("a")) closeMenu();
    });
    navigation.addEventListener("click", (event) => {
      if (event.target.closest("a[href^='#']")) updateCurrentNavigation();
    });
    window.addEventListener("hashchange", updateCurrentNavigation);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });

    window.addEventListener("resize", () => {
      if (window.matchMedia("(min-width: 721px)").matches) closeMenu();
    });
    updateCurrentNavigation();
  }

  const contactDetails = {
    whatsapp: CONTACTS.whatsapp
      ? {
          href: `https://wa.me/${CONTACTS.whatsapp.replace(/\D/g, "")}`,
          text: CONTACTS.whatsapp
        }
      : null,
    instagram: CONTACTS.instagram
      ? {
          href: `https://www.instagram.com/${CONTACTS.instagram.replace(/^@/, "")}/`,
          text: `@${CONTACTS.instagram.replace(/^@/, "")}`
        }
      : null
  };

  document.querySelectorAll("[data-contact]").forEach((card) => {
    const channel = card.dataset.contact;
    const details = contactDetails[channel];
    if (!details) return;

    const status = card.querySelector("[data-contact-status]");
    const detail = card.querySelector("[data-contact-detail]");
    const link = card.querySelector("[data-contact-link]");
    if (status) status.textContent = details.text;
    if (detail) detail.hidden = true;
    if (link) {
      link.href = details.href;
      link.hidden = false;
      link.style.marginTop = "1rem";
    }
  });
})();
