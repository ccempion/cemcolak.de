console.log("Skript erfolgreich geladen.");

const nav = document.querySelector(".nav");
const navMenu = document.querySelector(".nav-items");
const btnToggleNav = document.querySelector(".menu-btn");
const workEls = document.querySelectorAll(".work-box");
const workImgs = document.querySelectorAll(".work-img");
const mainEl = document.querySelector("main");
const typingText = document.getElementById("typing-text");
const cursor = document.querySelector(".cursor");

let titleIndex = 0; // Aktueller Index des jobTitles-Arrays
let charIndex = 0;  // Aktueller Buchstaben-Index
let isDeleting = false; // Gibt an, ob gerade gelöscht wird

//const yearEl = document.querySelector(".footer-text span");

const toggleNav = () => {
  nav.classList.toggle("hidden");

  // Prevent screen from scrolling when menu is opened
  document.body.classList.toggle("lock-screen");

  if (nav.classList.contains("hidden")) {
    btnToggleNav.textContent = "menu";
  } else {
    // When menu is opened after transition change text respectively
    setTimeout(() => {
      btnToggleNav.textContent = "close";
    }, 475);
  }
};

btnToggleNav.addEventListener("click", toggleNav);

navMenu.addEventListener("click", (e) => {
  if (e.target.localName === "a") {
    toggleNav();
  }
});

document.body.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !nav.classList.contains("hidden")) {
    toggleNav();
  }
});

// Animating work instances on scroll

workImgs.forEach((workImg) => workImg.classList.add("transform"));

let observer = new IntersectionObserver(
  (entries) => {
    const [entry] = entries;
    const [textbox, picture] = Array.from(entry.target.children);
    if (entry.isIntersecting) {
      picture.classList.remove("transform");
      Array.from(textbox.children).forEach(
        (el) => (el.style.animationPlayState = "running")
      );
    }
  },
  { threshold: 0.3 }
);

workEls.forEach((workEl) => {
  observer.observe(workEl);
});

// Toggle theme and store user preferred theme for future

const switchThemeEl = document.querySelector('input[type="checkbox"]');
const storedTheme = localStorage.getItem("theme");

switchThemeEl.checked = storedTheme === "dark" || storedTheme === null;

switchThemeEl.addEventListener("click", () => {
  const isChecked = switchThemeEl.checked;

  if (!isChecked) {
    document.body.classList.remove("dark");
    document.body.classList.add("light");
    localStorage.setItem("theme", "light");
    switchThemeEl.checked = false;
  } else {
    document.body.classList.add("dark");
    document.body.classList.remove("light");
    localStorage.setItem("theme", "dark");
  }
});

// Trap the tab when menu is opened

const lastFocusedEl = document.querySelector('a[data-focused="last-focused"]');

document.body.addEventListener("keydown", (e) => {
  if (e.key === "Tab" && document.activeElement === lastFocusedEl) {
    e.preventDefault();
    btnToggleNav.focus();
  }
});

// Rotating logos animation

const logosWrappers = document.querySelectorAll(".logo-group");

const sleep = (number) => new Promise((res) => setTimeout(res, number));

logosWrappers.forEach(async (logoWrapper, i) => {
  const logos = Array.from(logoWrapper.children);
  await sleep(1400 * i);
  setInterval(() => {
    let temp = logos[0];
    logos[0] = logos[1];
    logos[1] = logos[2];
    logos[2] = temp;
    logos[0].classList.add("hide", "to-top");
    logos[1].classList.remove("hide", "to-top", "to-bottom");
    logos[2].classList.add("hide", "to-bottom");
  }, 5600);
});

//yearEl.textContent = new Date().getFullYear();


// Impressum ein- und ausblenden

document.getElementById('toggle-impressum').addEventListener('click', function() {
  const impressum = document.getElementById('impressum');
  
  // Toggle Impressum anzeigen/ausblenden
  if (impressum.style.display === 'none' || impressum.style.display === '') {
    impressum.style.display = 'block';
    this.textContent = 'Toggle Legal Notice';
  } else {
    impressum.style.display = 'none';
    this.textContent = 'Legal Notice';
    return; // Kein Scrollen, wenn das Impressum ausgeblendet wird
  }

  // Scrollen zum Impressum
  impressum.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// Cookies & Datenschutz ein- und ausblenden

document.getElementById('toggle-cookies').addEventListener('click', function() {
  const cookiesSection = document.getElementById('cookies-section');

  // Toggle Cookies anzeigen/ausblenden
  if (cookiesSection.style.display === 'none' || cookiesSection.style.display === '') {
    cookiesSection.style.display = 'block';
    this.textContent = 'Toggle Privacy Policy';
  } else {
    cookiesSection.style.display = 'none';
    this.textContent = 'Privacy Policy';
    return; // Kein Scrollen, wenn der Abschnitt ausgeblendet wird
  }

  // Scrollen zum Cookies-Abschnitt
  cookiesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

const jobTitles = [
  "Digitalization Consultant ",
  "Junior Data Scientist ",
  "Software Developer ",
  // Business administration role:
  "Business Administrator ",
];


function typeEffect() {
  const currentTitle = jobTitles[titleIndex]; // aktueller Titel
  
  if (!isDeleting) {
    // Zeichen hinzufügen
    typingText.textContent = currentTitle.slice(0, charIndex++);
  } else {
    // Zeichen löschen
    typingText.textContent = currentTitle.slice(0, charIndex--);
  }

  // Wenn das Löschen abgeschlossen ist, zum nächsten Titel wechseln
  if (isDeleting && charIndex === 0) {
    isDeleting = false;
    titleIndex = (titleIndex + 1) % jobTitles.length; // Zum nächsten Titel wechseln
  }

  // Wenn das Schreiben abgeschlossen ist, kurz warten und dann löschen
  if (!isDeleting && charIndex === currentTitle.length) {
    isDeleting = true;
    setTimeout(typeEffect, 1600); // Pause vor dem Löschen
    return;
  }

  // Geschwindigkeit der Animation anpassen
  const typingSpeed = isDeleting ? 50 : 100; // Schneller beim Löschen
  setTimeout(typeEffect, typingSpeed);
}

document.addEventListener("DOMContentLoaded", () => {
  typeEffect(); // Startet die Animation
  hydrateFromResume();
});

//Skript für Kontaktformular
document.querySelector('.contact-form').addEventListener('submit', async function (e) {
  e.preventDefault(); // Standard-Submit verhindern
  const formData = new FormData(this); // Formulardaten erfassen
  const responseMessage = document.getElementById('response-message');
  const responseDiv = document.getElementById('form-response');
  const sendAnotherButton = document.getElementById('send-another');

  try {
      // Fetch-Anfrage an send-email.php
      const response = await fetch('send-email.php', {
          method: 'POST',
          body: formData, // Formulardaten anhängen
      });

      if (response.ok) {
          const result = await response.json(); // JSON-Antwort parsen
          responseMessage.innerText = result.message || "Your message has been sent successfully.";

          // Höhe und Breite des ursprünglichen Formulars übernehmen
          responseDiv.style.height = `${this.offsetHeight}px`;
          responseDiv.style.width = `${this.offsetWidth}px`;

          // Erfolgsmeldung anzeigen und Formular ausblenden
          responseDiv.style.display = 'flex'; // Flexbox für Zentrierung aktivieren
          this.style.display = 'none'; // Formular ausblenden
      } else {
          const errorResult = await response.json(); // Fehlerantwort parsen
          responseMessage.innerText = errorResult.error || "An error occurred while sending your message.";
          responseDiv.style.display = 'block';
      }
  } catch (error) {
      console.error("Fetch error:", error);
      responseMessage.innerText = "An unexpected error occurred.";
      responseDiv.style.display = 'block';

  }

  // Event für "Noch eine Nachricht senden"-Button
  sendAnotherButton.addEventListener('click', () => {
      this.reset(); // Formular zurücksetzen
      this.style.display = 'block'; // Formular anzeigen
      responseDiv.style.display = 'none'; // Erfolgsmeldung ausblenden
      //sendAnotherButton.style.textDecorationColor = '#505050'; // Textdekorationsfarbe zurücksetzen
      
  });
});

// Animation Scroll

// Smooth scrolling nur für Navigation-Anker
document.querySelectorAll('.nav-item a').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const href = this.getAttribute('href');
    if (href && href.startsWith('#')) {
      const targetId = href.replace('#', '');
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  });
});