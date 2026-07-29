import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Always start at the top on page load/refresh
if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}
window.scrollTo(0, 0);

// pageshow fires after bfcache restore AND normal load — catches all cases
window.addEventListener("pageshow", () => {
  window.scrollTo(0, 0);
});

// Belt-and-suspenders: run after first paint in case browser restores scroll late
requestAnimationFrame(() => {
  window.scrollTo(0, 0);
});

createRoot(document.getElementById("root")!).render(<App />);
