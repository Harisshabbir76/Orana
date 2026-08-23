import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import ClientLayout from "./components/ClientLayout";
import LangApplier from "./components/LangApplier";
import { CurrencyProvider } from "./context/CurrencyContext";
import { StoreProvider } from "./context/StoreContext";
import { AuthProvider } from "./context/AuthContext";

export const metadata: Metadata = {
  title: "Orana",
  description: "Made for the way you move",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const cookieStore = await cookies();
  const language = cookieStore.get("orana_language")?.value ?? "English";
  const currency = cookieStore.get("orana_currency")?.value ?? "AED";
  const isArabic = language === "Arabic";

  return (
    <html
      lang={isArabic ? "ar" : "en"}
      dir={isArabic ? "rtl" : "ltr"}
      className="h-full"
      suppressHydrationWarning
    >
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/qjw7ftu.css" />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <AuthProvider>
          <StoreProvider>
            <CurrencyProvider initialLanguage={language} initialCurrency={currency}>
              <LangApplier />
              <ClientLayout>
                {children}
              </ClientLayout>
            </CurrencyProvider>
          </StoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
