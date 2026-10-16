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
