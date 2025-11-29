"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import { useChat } from "../hooks/useChat";
import { useAISettings } from "../hooks/useAISettings";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [contextId, setContextId] = useState<string>("");
  const [contextType, setContextType] = useState<
    "visit_report" | "deal" | "contact" | "account" | undefined
  >(undefined);
  const { mutate: sendMessage, isPending } = useChat();
  const { settings } = useAISettings();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSend = () => {
    if (!input.trim() || isPending || !settings.enabled) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");

    sendMessage(
      {
        message: currentInput,
        context: contextId || undefined,
        context_type: contextType,
      },
      {
        onSuccess: (response) => {
          // Log response from AI for debugging
          console.log("=== AI RESPONSE DEBUG ===");
          console.log("Full response:", response);
          console.log("Message content:", response.data.message);
          console.log("Message length:", response.data.message.length);
          console.log("Contains table markdown:", response.data.message.includes("|"));
          console.log("Raw message preview:", response.data.message.substring(0, 500));
          console.log("=========================");

          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: response.data.message,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, assistantMessage]);
        },
        onError: (error) => {
          console.error("=== AI ERROR DEBUG ===");
          console.error("Error:", error);
          console.error("======================");

          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: "Sorry, I encountered an error. Please try again.",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, errorMessage]);
        },
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Custom components for markdown rendering with explicit table styling
  const markdownComponents: Components = {
    table: ({ children, ...props }) => (
      <div className="overflow-x-auto my-4 -mx-2">
        <table 
          className="w-full text-sm" 
          style={{ 
            borderCollapse: 'collapse',
            width: '100%',
            border: '1px solid hsl(var(--muted-foreground) / 0.4)'
          }}
          {...props}
        >
          {children}
        </table>
      </div>
    ),
    thead: ({ children, ...props }) => (
      <thead 
        className="bg-muted/50" 
        {...props}
      >
        {children}
      </thead>
    ),
    tbody: ({ children, ...props }) => (
      <tbody {...props}>
        {children}
      </tbody>
    ),
    tr: ({ children, ...props }) => (
      <tr 
        className="hover:bg-muted/30 transition-colors" 
        {...props}
      >
        {children}
      </tr>
    ),
    th: ({ children, ...props }) => (
      <th 
        className="px-4 py-2.5 text-left font-semibold text-xs bg-muted/50 align-top" 
        style={{ 
          border: '1px solid hsl(var(--muted-foreground) / 0.4)',
          borderBottom: '2px solid hsl(var(--muted-foreground) / 0.5)'
        }}
        {...props}
      >
        {children}
      </th>
    ),
    td: ({ children, ...props }) => (
      <td 
        className="px-4 py-2.5 text-sm align-top" 
        style={{ 
          border: '1px solid hsl(var(--muted-foreground) / 0.4)'
        }}
        {...props}
      >
        {children}
      </td>
    ),
  };

  if (!settings.enabled) {
    return (
      <div className="flex items-center justify-center h-full min-h-[600px]">
        <p className="text-muted-foreground text-sm">
          AI Assistant is disabled. Please enable it in settings.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-16rem)] max-h-[800px] bg-background border rounded-lg overflow-hidden">
      {/* Messages Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-3"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-muted text-foreground rounded-bl-sm"
              }`}
            >
              {message.role === "assistant" ? (
                <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:mt-0 prose-headings:mb-2 prose-p:my-1 prose-p:leading-relaxed prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-code:text-xs prose-code:bg-muted/50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:my-2 prose-pre:bg-muted/50 prose-pre:p-2 prose-pre:rounded prose-pre:overflow-x-auto prose-blockquote:border-l-2 prose-blockquote:border-muted-foreground/30 prose-blockquote:pl-3 prose-blockquote:italic prose-strong:font-semibold prose-a:text-primary prose-a:underline [&_table]:!border-collapse [&_table_td]:!border [&_table_th]:!border [&_table_td]:!border-border [&_table_th]:!border-border">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={markdownComponents}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {message.content}
                </p>
              )}
            </div>
          </div>
        ))}
        {isPending && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-2.5">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t bg-background px-4 py-3">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="w-full resize-none rounded-2xl border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] max-h-[120px]"
              disabled={isPending}
              rows={1}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isPending}
            className="flex-shrink-0 h-11 w-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
