import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    template: "%s | HPS SEA FOODS",
    default: "HPS SEA FOODS | Fish Business & Operations Management System",
  },
  description:
    "Comprehensive fish business management system for HPS SEA FOODS — procurement, cold storage inventory, customer sales dispatches, expenses, packing costing, and financial accounting.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const storedTheme = localStorage.getItem('aquaflow-ui-theme');
                const supportDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (storedTheme === 'dark' || (!storedTheme && supportDarkMode) || (storedTheme === 'system' && supportDarkMode)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased font-sans">
        <ThemeProvider defaultTheme="system" storageKey="aquaflow-ui-theme">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
