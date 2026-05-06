import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Apply theme before render to avoid flash
const savedTheme = localStorage.getItem("scrubsigns-theme");
if (savedTheme === "light") {
  document.documentElement.classList.add("light");
  document.body.classList.add("light-mode");
}

createRoot(document.getElementById("root")!).render(<App />);
