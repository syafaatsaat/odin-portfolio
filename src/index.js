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

// Launch progress: fills the header's fuel gauge as the page is scrolled
function updateLaunchProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 1;
  header.style.setProperty("--progress", progress);
}

let ticking = false;
window.addEventListener(
  "scroll",
  () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateActiveLink();
      updateLaunchProgress();
      ticking = false;
    });
  },
  { passive: true },
);
window.addEventListener("resize", () => {
  updateActiveLink();
  updateLaunchProgress();
});
updateActiveLink();
updateLaunchProgress();

// Shooting star: every 8-15s one streaks across a random part of the upper sky
const starfield = document.querySelector(".stars");

function launchShootingStar() {
  // Skip while the tab is in the background so they don't pile up
  if (!document.hidden) {
    const star = document.createElement("span");
    star.className = "shooting-star";
    star.style.left = `${Math.random() * 70}vw`;
    star.style.top = `${Math.random() * 50}vh`;
    star.style.setProperty("--angle", `${20 + Math.random() * 25}deg`);
    star.addEventListener("animationend", () => star.remove());
    starfield.appendChild(star);
  }
  setTimeout(launchShootingStar, 8000 + Math.random() * 7000);
}

if (!reduceMotion) {
  setTimeout(launchShootingStar, 3000);
}

// Warp effect: jumping via the nav stretches the stars into streaks for the trip
let warpTimer;

function endWarp() {
  clearTimeout(warpTimer);
  starfield.classList.remove("warping");
}

function warp(direction) {
  const goingUp = direction < 0;
  // Streaks trail behind the stars: below them going down the page, above going up
  starfield.style.setProperty("--warp-origin", goingUp ? "bottom" : "top");
  starfield.classList.toggle("warp-up", goingUp);
  starfield.classList.add("warping");

  for (let i = 0; i < 24; i++) {
    const streak = document.createElement("span");
    streak.className = "warp-streak";
    streak.style.left = `${Math.random() * 100}vw`;
    streak.style.top = `${Math.random() * 100}vh`;
    streak.style.height = `${40 + Math.random() * 80}px`;
    streak.style.animationDelay = `${Math.random() * 250}ms`;
    streak.addEventListener("animationend", () => streak.remove());
    starfield.appendChild(streak);
  }

  // Drop out of warp when the smooth scroll lands (with a fallback for older browsers)
  clearTimeout(warpTimer);
  window.addEventListener("scrollend", endWarp, { once: true });
  warpTimer = setTimeout(endWarp, 1200);
}

if (!reduceMotion) {
  document.querySelectorAll("#home-link, #nav-links a").forEach((link) => {
    link.addEventListener("click", () => {
      const id = link.getAttribute("href").slice(1);
      const target = id ? document.getElementById(id) : null;
      const distance = target
        ? target.getBoundingClientRect().top - header.offsetHeight
        : -window.scrollY;
      // Already (nearly) there: no trip, no warp
      if (Math.abs(distance) > 80) warp(distance);
    });
  });
}

// Konami code: unlocks the "Classified" mission placeholder
const konamiCode = [
  "arrowup", "arrowup", "arrowdown", "arrowdown",
  "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a",
];
let konamiProgress = 0;

const scrambleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*<>/";

// Decrypt effect: random characters settle into the final text from left to right
function scrambleTo(el, finalText, duration = 900) {
  if (reduceMotion) {
    el.textContent = finalText;
    return;
  }

  const start = performance.now();
  function frame(now) {
    const progress = Math.min((now - start) / duration, 1);
    const settled = Math.floor(progress * finalText.length);
    el.textContent = [...finalText]
      .map((ch, i) => {
        if (i < settled || ch === " ") return ch;
        return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
      })
      .join("");
    if (progress < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function unlockFutureMission() {
  const future = document.querySelector(".future");
  future.classList.add("unlocked");
  scrambleTo(future.querySelector(".future-title"), "Decrypted");
  scrambleTo(
    future.querySelector(".future-code"),
    "Next mission in progress. Stand by for launch.",
    1600,
  );
}

document.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();
  if (key === konamiCode[konamiProgress]) {
    konamiProgress++;
  } else {
    // A wrong key can still be the start of a fresh attempt (an extra ↑ keeps the ↑ ↑ already typed)
    if (key !== konamiCode[0]) konamiProgress = 0;
    else if (konamiProgress !== 2) konamiProgress = 1;
  }

  if (konamiProgress === konamiCode.length) {
    konamiProgress = 0;
    if (!document.querySelector(".future.unlocked")) unlockFutureMission();
  }
});

// Typewriter helpers: split an element's text into typed / not-yet-typed halves.
// The untyped half stays in the layout (just invisible) so nothing shifts while typing
function prepareTypewriter(el) {
  const message = el.textContent.trim();
  const typed = document.createElement("span");
  const untyped = document.createElement("span");
  untyped.className = "untyped";
  untyped.textContent = message;
  // Screen readers get the whole message, not the letter-by-letter version
  const srText = document.createElement("span");
  srText.className = "sr-only";
  srText.textContent = message;
  typed.setAttribute("aria-hidden", "true");
  untyped.setAttribute("aria-hidden", "true");
  el.replaceChildren(srText, typed, untyped);
  return { message, typed, untyped };
}

function makeCursor() {
  const cursor = document.createElement("span");
  cursor.className = "cursor";
  cursor.setAttribute("aria-hidden", "true");
  return cursor;
}

// Types one prepared element out, carrying the cursor along; resolves when done
function typeOut({ message, typed, untyped }, cursor, speed) {
  typed.after(cursor);
  return new Promise((resolve) => {
    function typeNext(i) {
      typed.textContent = message.slice(0, i);
      untyped.textContent = message.slice(i);
      if (i < message.length) setTimeout(() => typeNext(i + 1), speed);
      else resolve();
    }
    typeNext(0);
  });
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Runs `callback` once, the first time `el` scrolls into view
function onFirstView(el, callback) {
  const observer = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;
    observer.disconnect();
    callback();
  });
  observer.observe(el);
}

if (!reduceMotion && "IntersectionObserver" in window) {
  // Boot sequence: the explorer badge types itself out field by field, like a terminal booting.
  // The status light only switches on once the whole profile is "online"
  const badge = document.querySelector(".badge");
  const fields = [...badge.querySelectorAll("dt, dd")].map(prepareTypewriter);
  const bootCursor = makeCursor();
  badge.classList.add("booting");
  fields[0].typed.after(bootCursor);

  onFirstView(badge, async () => {
    // Let the scroll reveal fade the badge in first
    await wait(700);
    for (let i = 0; i < fields.length; i++) {
      const isLabel = i % 2 === 0;
      await typeOut(fields[i], bootCursor, isLabel ? 25 : 40);
      await wait(isLabel ? 80 : 180);
    }
    bootCursor.remove();
    badge.classList.remove("booting");
  });

  // Typewriter footer: "End Of Transmission" types itself out once it scrolls into view
  const footerText = document.querySelector("footer p");
  const footerTyping = prepareTypewriter(footerText);
  const footerCursor = makeCursor();
  footerTyping.untyped.before(footerCursor);
  onFirstView(footerText, () => typeOut(footerTyping, footerCursor, 70));
}
