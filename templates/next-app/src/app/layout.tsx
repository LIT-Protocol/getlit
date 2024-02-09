import "./globals.css";

import { ReactNode } from "react";
import StytchProvider from "@/components/StytchProvider";

import { Providers } from "./providers";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <StytchProvider>
      <html lang="en">
        <body>
          <main>
            <Providers>{children}</Providers>
          </main>
        </body>
      </html>
    </StytchProvider>
  );
}
