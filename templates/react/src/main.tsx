import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Buffer } from "buffer";
import React from "react";
import ReactDOM from "react-dom/client";
import { WagmiProvider } from "wagmi";
import { StytchUIClient } from "@stytch/vanilla-js";
import { StytchProvider } from "@stytch/react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import App from "./App.tsx";
import { config } from "./wagmi.ts";

import "./styles/globals.css";
import LoginView from "./login.tsx";

globalThis.Buffer = Buffer;

const queryClient = new QueryClient();

// We initialize the Stytch client using our project's public token which can be found in the Stytch dashboard
const stytch = new StytchUIClient(import.meta.env.VITE_STYTCH_PUBLIC_TOKEN);

// biome-ignore lint/style/noNonNullAssertion: <explanation>
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <StytchProvider stytch={stytch}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <main>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<App />} />
                <Route path="/login" element={<LoginView />} />
              </Routes>
            </BrowserRouter>
          </main>
        </QueryClientProvider>
      </WagmiProvider>
    </StytchProvider>
  </React.StrictMode>
);
