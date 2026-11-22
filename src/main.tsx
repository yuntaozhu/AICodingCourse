import React from "react";
import ReactDOM from "react-dom/client";
import "reveal.js/reveal.css";
import "reveal.js/theme/black.css";
import { AuthProvider } from "@/context/AuthContext";
import "./app/globals.css";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
