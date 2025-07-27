"use client"

import type React from "react"
import { SessionProvider } from "next-auth/react"
import { Provider } from "react-redux"
import { store } from "@/store"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/contexts/language-context"
import { CurrencyProvider } from "@/contexts/currency-context"
import { ChatProvider } from "@/contexts/chat-context"
import { LiveChat } from "@/components/support/live-chat"
import { CartProvider } from "@/contexts/cart-context"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Provider store={store}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <LanguageProvider>
            <CurrencyProvider>
              <ChatProvider>
                <CartProvider>
                <div className="min-h-screen flex flex-col">
                  <main className="flex-1">{children}</main>
                  <LiveChat />
                </div>
                </CartProvider>
              </ChatProvider>
            </CurrencyProvider>
          </LanguageProvider>
        </ThemeProvider>
      </Provider>
    </SessionProvider>
  )
}
