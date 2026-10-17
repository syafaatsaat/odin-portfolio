import "./styles.css";

// Mission clock: counts up from page load, like the T+ timer in the mockup
const clock = document.querySelector("#mission-clock");
const launchTime = Date.now();

function pad(n) {
  return String(n).padStart(2, "0");
}

function tick() {
  const elapsed = Math.floor((Date.now() - launchTime) / 1000);
  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;
  clock.textContent = `T+${pad(h)}:${pad(m)}:${pad(s)}`;
}

tick();
setInterval(tick, 1000);

// Burger menu (small screens): toggle the nav dropdown
const menuToggle = document.querySelector("#menu-toggle");
const navLinks = document.querySelector("#nav-links");

function setMenuOpen(open) {
  navLinks.classList.toggle("open", open);
  menuToggle.setAttribute("aria-expanded", String(open));
}

menuToggle.addEventListener("click", () => {
  setMenuOpen(!navLinks.classList.contains("open"));
});

// Close after picking a link, clicking elsewhere, or pressing Escape
navLinks.addEventListener("click", (e) => {
  if (e.target.closest("a")) setMenuOpen(false);
});

document.addEventListener("click", (e) => {
  if (!e.target.closest("#navbar")) setMenuOpen(false);
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") setMenuOpen(false);
});

// Scroll reveal: fade content up as it comes on screen, staggered within each group
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!reduceMotion && "IntersectionObserver" in window) {
  const groups = [
    ...document.querySelectorAll("section"),
    ...document.querySelectorAll(".project-grid, .bay, .tags"),
  ];

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -10% 0px" },
  );

  groups.forEach((group) => {
    // Containers don't move as one block; their own children animate instead
    const children = [...group.children].filter(
      (el) => !el.matches(".project-grid, .bay, .tags"),
    );
    children.forEach((el, i) => {
      el.classList.add("reveal");
      el.style.setProperty("--i", Math.min(i, 6));
      revealObserver.observe(el);
    });
  });
}

// Active nav link: highlight the section currently being read
const sections = [...document.querySelectorAll("main section")];
const navAnchors = [...document.querySelectorAll("#nav-links a")];
const header = document.querySelector("header");

function updateActiveLink() {
  const line = header.offsetHeight + window.innerHeight / 3;
  const atBottom =
    window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;

  // The last section whose top has passed the reading line (or the last one at page bottom)
  let current = sections[0];
  sections.forEach((section) => {
    if (section.getBoundingClientRect().top <= line) current = section;
  });
  if (atBottom) current = sections[sections.length - 1];

  navAnchors.forEach((a) => {
    const isActive = a.getAttribute("href") === `#${current.id}`;
    a.classList.toggle("active", isActive);
    if (isActive) a.setAttribute("aria-current", "location");
    else a.removeAttribute("aria-current");
  });
}

let ticking = false;
window.addEventListener(
  "scroll",
  () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateActiveLink();
      ticking = false;
    });
  },
  { passive: true },
);
window.addEventListener("resize", updateActiveLink);
updateActiveLink();
