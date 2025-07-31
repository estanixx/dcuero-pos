// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/navbar";
import { Auth0User, Sede } from "@/types";
import { getAuth0User, getAvailableSedes, getSedesObject } from "@/lib/api";
import clsx from "clsx";
import { SessionProvider } from "@/context/session";
import { Toaster } from "@/components/ui/sonner";
import { CustomerModalProvider } from "@/context/customer-modal";
import { ProductModalProvider } from "@/context/product-modal";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dcuero POS",
  description: "POS for Dcuero stores",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user: Auth0User | null = await getAuth0User();
  const availableSedes: Sede[] = user ? await getAvailableSedes(user) : [];
  const allSedes: {[key:string]: Sede} = await getSedesObject() ?? {};
  return (
    <html lang="en">
      <SessionProvider value={{ user, availableSedes, allSedes }}>
        <CustomerModalProvider>
          <ProductModalProvider>
            <body
              className={clsx(
                inter.className,
                "flex justify-center items-center flex-col gap-6"
              )}
            >
              <Navbar user={user} availableSedes={availableSedes} />
              {children}
              <Toaster richColors position="top-right" />
            </body>
          </ProductModalProvider>
        </CustomerModalProvider>
      </SessionProvider>
    </html>
  );
}