import { Inter, DM_Serif_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const dmSerifDisplay = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-dm-serif",
  display: "swap",
});

export const metadata = {
  title: "EstateHub — Find the Home You'll Love",
  description:
    "Find the perfect property for your family. Browse verified listings, watch virtual property tours, and connect with top real estate agents on EstateHub.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${dmSerifDisplay.variable}`}
    >
      <body className="h-screen flex flex-col overflow-hidden antialiased selection:bg-orange selection:text-white">
        {children}
      </body>
    </html>
  );
}