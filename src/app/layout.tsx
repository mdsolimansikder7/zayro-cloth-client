import type { Metadata } from "next";
import { Archivo_Black, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toast";
import { AccountDataProvider } from "@/components/account-data-provider";
import AuthProvider from "@/components/auth-provider";
import { CartDataProvider } from "@/components/cart-data-provider";
import { StorefrontProvider } from "@/components/storefront-provider";

// Heading font
const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-archivo",
});

// Body font
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "Zayro",
  description:
    "Browse through our diverse range of meticulously crafted garments, designed to bring out your individuality and cater to your sense of style.",
  icons: [
    { rel: "icon", type: "image/svg+xml", url: "/favicon.svg" },
    { rel: "apple-touch-icon", url: "/favicon.svg" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${archivoBlack.variable} ${plusJakarta.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <Toaster>
            <AuthProvider>
              <StorefrontProvider>
                <AccountDataProvider>
                  <CartDataProvider>{children}</CartDataProvider>
                </AccountDataProvider>
              </StorefrontProvider>
            </AuthProvider>
          </Toaster>
        </ThemeProvider>
      </body>
    </html>
  );
}
