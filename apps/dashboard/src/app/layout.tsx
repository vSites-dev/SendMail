import "@/globals.css";
import { type Metadata } from "next";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

import { TRPCReactProvider } from "@/trpc/react";
import { Toaster } from "sonner";
import { AnimatePresence } from "framer-motion";

export const metadata: Metadata = {
  title: "SendMail - Vezérlőpult",
  description: "SendMail Vezérlőpult",
  icons: [{ rel: "icon", url: "/brand/icon.svg" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="hu" className={`${poppins.variable}`}>
      <body>
        <TRPCReactProvider>
          <AnimatePresence mode="popLayout">{children}</AnimatePresence>
        </TRPCReactProvider>

        <Toaster
          richColors
          closeButton
          position="bottom-right"
          duration={6000}
        />
      </body>
    </html>
  );
}
