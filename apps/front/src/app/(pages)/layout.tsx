import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner"
import "../globals.css";
import { SessionWrapper } from "@/SessionWrapper";
import RootUserProvider from "@/components/Store-layouts/RootUserProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cirqle",
  description: "Created by Vivek Kumar",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toaster />
        <div className='bg-gradient-to-br bg-black text-white dark:bg-black w-full min-h-dvh '>
          <div className='w-full max-md:h-dvh flex md:flex-row  flex-wrap h-full overflow-hidden md:h-dvh'>
            {/* left col */}

            <SessionWrapper>
              <RootUserProvider />
            </SessionWrapper>
            {/* center */}

            <div className=' flex-1 h-full  w-full overflow-y-auto [scrollbar-width:none] mb-96'>
              {children}

            </div>

            {/* right col mx-auto md:max-w-[860px] */}
            {/* <div className='w-[32%] max-lg:hidden'>
              <Suggestions />
            </div> */}
          </div>
        </div>

      </body>
    </html>
  );
}
