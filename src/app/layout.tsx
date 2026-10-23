import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#0f2744",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "FATOS & FAKES | Central Cívica da Verdade & Pesquisa Eleitoral Auditável",
  description: "Descubra o que é fato e o que é fake news na política brasileira em linguagem simples. Participe da pesquisa eleitoral cívica com voto 100% secreto e auditado por CPF único.",
  keywords: [
    "Fatos e Fakes", 
    "Fake News", 
    "Eleições 2026", 
    "Pesquisa Eleitoral", 
    "Voto Secreto", 
    "Checagem de Notícias", 
    "TSE", 
    "Política Brasileira",
    "Presidente",
    "Governadores",
    "Senadores",
    "Deputados"
  ],
  authors: [{ name: "Central Cívica FATOS & FAKES" }],
  openGraph: {
    title: "FATOS & FAKES | Central Cívica da Verdade & Pesquisa Eleitoral",
    description: "Saiba o que é verdade e o que é boato sobre os políticos brasileiros. Vote na pesquisa eleitoral auditada com sigilo absoluto.",
    url: "https://fatosfakes.com.br",
    siteName: "FATOS & FAKES",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FATOS & FAKES | Central da Verdade & Pesquisa Eleitoral",
    description: "Descubra o que é fato e o que é fake em 3 segundos. Participe da pesquisa eleitoral com voto secreto por CPF.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className="h-full antialiased font-sans"
    >
      <body className="min-h-full flex flex-col bg-[#f8fafc] text-slate-900 font-sans">
        {children}
      </body>
    </html>
  );
}
