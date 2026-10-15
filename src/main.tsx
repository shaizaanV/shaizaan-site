import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { installCursor } from "./os/cursor";
import "./theme/tokens.css";
import "./theme/os.css";

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root element");

installCursor();
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);
