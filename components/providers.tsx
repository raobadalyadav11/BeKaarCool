"use client"

import type React from "react"
import { SessionProvider } from "next-auth/react"
import { Provider } from "react-redux"
import { store } from "@/store"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/contexts/language-context"
import { CurrencyProvider } from "@/contexts/currency-context"
import { ChatProvider } from "@/contexts/chat-context"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { LiveChat } from "@/components/support/live-chat"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Provider store={store}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <LanguageProvider>
            <CurrencyProvider>
              <ChatProvider>
                <div className="min-h-screen flex flex-col">
                  <Header />
                  <main className="flex-1">{children}</main>
                  <Footer />
                  <LiveChat />
                </div>
              </ChatProvider>
            </CurrencyProvider>
          </LanguageProvider>
        </ThemeProvider>
      </Provider>
    </SessionProvider>
  )
}
