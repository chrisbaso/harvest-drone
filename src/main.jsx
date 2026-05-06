import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import ConfigErrorPage from "./components/ConfigErrorPage";
import { AuthProvider } from "./context/AuthContext";
import { supabaseConfigError } from "./lib/supabase";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {supabaseConfigError ? (
      <ConfigErrorPage message={supabaseConfigError} />
    ) : (
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    )}
  </React.StrictMode>
);
