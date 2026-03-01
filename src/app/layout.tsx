import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import { SiteNav } from "@/components/site-nav";

import { JsonLd, getWebsiteJsonLd, getDatasetJsonLd } from "@/components/json-ld";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://extrateto.org"),
  title: {
    default: "ExtraTeto — Supersalários do Judiciário Brasileiro",
    template: "%s | ExtraTeto",
  },
  description:
    "Dashboard público que expõe remunerações acima do teto constitucional no sistema de Justiça brasileiro. Dados públicos, fiscalização cidadã.",
  keywords: [
    "supersalários",
    "judiciário",
    "teto constitucional",
    "remuneração",
    "penduricalhos",
    "transparência",
    "dados públicos",
    "Brasil",
  ],
  authors: [{ name: "ExtraTeto" }],
  openGraph: {
    title: "ExtraTeto — Supersalários do Judiciário Brasileiro",
    description:
      "Descubra quem recebe acima do teto constitucional no Judiciário brasileiro.",
    type: "website",
    locale: "pt_BR",
    siteName: "ExtraTeto",
  },
  twitter: {
    card: "summary_large_image",
    title: "ExtraTeto — Supersalários do Judiciário Brasileiro",
    description:
      "Descubra quem recebe acima do teto constitucional no Judiciário brasileiro.",
  },
  alternates: {
    canonical: "https://extrateto.org",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head />
      <body
        className={`${playfair.variable} ${dmSans.variable} font-sans antialiased`}
      >
        <JsonLd data={getWebsiteJsonLd()} />
        <JsonLd data={getDatasetJsonLd()} />
        <SiteNav />
        <div className="pt-12 lg:pl-56 lg:pt-0">
          {children}
        </div>
      </body>
    </html>
  );
}
