import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/storage";
import { Navigation } from "@/components/Navigation";
import { SettingsPanel } from "@/components/SettingsPanel";
import { EcoChat } from "@/components/EcoChat";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Sprout | Beyond Silence",
  description: "Your footprint leaves a mark. Why not leave a garden?",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${instrumentSerif.variable}`}>
      <body className="bg-surface text-on-surface selection:bg-primary selection:text-white antialiased min-h-screen flex flex-col">
        <AppProvider>
          {/* TopNavBar */}
          <Navigation />
          
          <main className="flex-1 relative flex flex-col pt-[calc(8rem-75px)]">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-surface-container-low border-t border-primary/5 py-12 mt-auto">
            <div className="flex flex-col md:flex-row justify-between items-center px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto gap-4">
              <div className="font-display text-xl text-primary">Sprout®</div>
              <div className="flex gap-8 text-on-surface-variant font-body text-sm">
                <a className="hover:text-primary transition-colors underline decoration-1 underline-offset-4" href="#">Privacy Policy</a>
                <a className="hover:text-primary transition-colors underline decoration-1 underline-offset-4" href="#">Terms of Service</a>
                <a className="hover:text-primary transition-colors underline decoration-1 underline-offset-4" href="#">Studio Access</a>
              </div>
              <div className="text-secondary font-body text-sm">© 2024 Sprout® All rights reserved.</div>
            </div>
          </footer>

          <SettingsPanel />
          <EcoChat />
        </AppProvider>
      </body>
    </html>
  );
}
