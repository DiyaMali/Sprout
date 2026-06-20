import type { Metadata } from 'next';
import { Inter, Instrument_Serif } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/lib/storage';
import { Navigation } from '@/components/Navigation';
import { SettingsPanel } from '@/components/SettingsPanel';
import { EcoChat } from '@/components/EcoChat';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

const instrumentSerif = Instrument_Serif({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'Sprout | Beyond Silence',
  description: 'Your footprint leaves a mark. Why not leave a garden?',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${instrumentSerif.variable}`}>
      <body className="bg-surface text-on-surface selection:bg-primary flex min-h-screen flex-col antialiased selection:text-white">
        {/* Skip link — first element in body for keyboard users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-black focus:shadow-lg focus:outline-none"
        >
          Skip to main content
        </a>

        <AppProvider>
          {/* TopNavBar */}
          <Navigation />

          <main
            id="main-content"
            className="relative flex flex-1 flex-col pt-[calc(8rem-75px)]"
          >
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-surface-container-low border-primary/5 mt-auto border-t py-12">
            <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto flex flex-col items-center justify-between gap-4 md:flex-row">
              <div className="font-display text-primary text-xl">Sprout®</div>
              <div className="text-on-surface-variant font-body flex gap-8 text-sm">
                <a
                  className="hover:text-primary underline decoration-1 underline-offset-4 transition-colors"
                  href="#"
                >
                  Privacy Policy
                </a>
                <a
                  className="hover:text-primary underline decoration-1 underline-offset-4 transition-colors"
                  href="#"
                >
                  Terms of Service
                </a>
                <a
                  className="hover:text-primary underline decoration-1 underline-offset-4 transition-colors"
                  href="#"
                >
                  Studio Access
                </a>
              </div>
              <div className="text-secondary font-body text-sm">
                © 2024 Sprout® All rights reserved.
              </div>
            </div>
          </footer>

          <SettingsPanel />
          <EcoChat />
        </AppProvider>
      </body>
    </html>
  );
}
