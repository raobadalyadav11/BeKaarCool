"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useSession } from "next-auth/react"

interface Message {
  id: string
  text: string
  sender: "user" | "support"
  timestamp: Date
  attachments?: string[]
}

interface ChatContextType {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  messages: Message[]
  sendMessage: (text: string, attachments?: string[]) => void
  isTyping: boolean
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    if (session?.user) {
      // Load chat history
      loadChatHistory()
    }
  }, [session])

  const loadChatHistory = async () => {
    try {
      const response = await fetch("/api/support/chat/history")
      const data = await response.json()
      setMessages(data.messages || [])
    } catch (error) {
      console.error("Error loading chat history:", error)
    }
  }

  const sendMessage = async (text: string, attachments?: string[]) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: "user",
      timestamp: new Date(),
      attachments,
    }

    setMessages((prev) => [...prev, newMessage])

    try {
      const response = await fetch("/api/support/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, attachments }),
      })

      if (response.ok) {
        // Simulate typing indicator
        setIsTyping(true)
        setTimeout(() => {
          setIsTyping(false)
          // Add auto-response (in real app, this would come from WebSocket)
          const autoResponse: Message = {
            id: (Date.now() + 1).toString(),
            text: "Thank you for your message. Our support team will get back to you shortly.",
            sender: "support",
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, autoResponse])
        }, 2000)
      }
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  return (
    <ChatContext.Provider value={{ isOpen, setIsOpen, messages, sendMessage, isTyping }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider")
  }
  return context
}
