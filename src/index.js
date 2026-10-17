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
