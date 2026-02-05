import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/supabase/auth-provider";
import { ThemeProvider } from "@/lib/supabase/theme-provider";
import { NotificationProvider } from "@/lib/notifications";
import { NotificationContainer } from "@/components/notifications/notification-container";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Impeto - Level Up Your Life",
  description: "A gamified task management app that turns your to-do list into an epic RPG adventure",
  icons: {
    icon: '/favicon.svg'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          <ThemeProvider>
            <NotificationProvider>
              {children}
              <NotificationContainer />
            </NotificationProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
