import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/figtree";
import "./design/tokens.css";
import "./app/app.css";
import "./exercise/mf02.css";
import "./scene/scene.css";
import { AppShell } from "./app/AppShell";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppShell />
  </StrictMode>,
);
