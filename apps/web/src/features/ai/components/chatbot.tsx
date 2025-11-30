"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Send, Loader2, Copy, Check, Settings, Plus, MoreVertical } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import { useChat } from "../hooks/useChat";
import { useAISettings } from "../hooks/useAISettings";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { AccountDetailModal } from "@/features/sales-crm/account-management/components/account-detail-modal";
import { ContactDetailModal } from "@/features/sales-crm/account-management/components/contact-detail-modal";
import { TaskDetailModal } from "@/features/sales-crm/task-management/components/task-detail-modal";
import { VisitReportDetailModal } from "@/features/sales-crm/visit-report/components/visit-report-detail-modal";
import { DealDetailModal } from "@/features/sales-crm/pipeline-management/components/deal-detail-modal";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// Stable ID generator to avoid hydration errors
let messageIdCounter = 1;
function generateMessageId(): string {
  return `msg-${messageIdCounter++}`;
}

// Extract custom links from markdown and create a map
function extractCustomLinks(markdown: string): Map<string, string> {
  const linkMap = new Map<string, string>();
  // Match [text](type://uuid) format where UUID can contain hyphens
  // UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  const customLinkRegex = /\[([^\]]+)\]\((\w+:\/\/[a-f0-9-]+)\)/gi;
  let match;
  
  while ((match = customLinkRegex.exec(markdown)) !== null) {
    const linkText = match[1];
    const linkHref = match[2];
    linkMap.set(linkText, linkHref);
  }
  
  return linkMap;
}

export function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial-greeting",
      role: "assistant",
      content: "Hello! How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);
  const { mutate: sendMessage, isPending } = useChat();
  const { settings } = useAISettings();
  const { user } = useAuthStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Use settings.model as default, but allow user to override via Select
  const [userSelectedModel, setUserSelectedModel] = useState<string | null>(null);
  const selectedModel = userSelectedModel || settings.model || "llama-3.1-8b";

  // State for detail modals/drawers
  const [viewingAccountId, setViewingAccountId] = useState<string | null>(null);
  const [viewingContactId, setViewingContactId] = useState<string | null>(null);
  const [viewingTaskId, setViewingTaskId] = useState<string | null>(null);
  const [viewingVisitReportId, setViewingVisitReportId] = useState<string | null>(null);
  const [viewingDealId, setViewingDealId] = useState<string | null>(null);

  // Get avatar URL from backend
  const userAvatarUrl = useMemo(() => {
    return user?.avatar_url || null;
  }, [user?.avatar_url]);

  // Handle custom link clicks (type://ID format)
  const handleLinkClick = useCallback((_e: React.MouseEvent<HTMLAnchorElement> | MouseEvent, href: string) => {
    // Parse custom link format: type://ID
    const customLinkRegex = /^(\w+):\/\/([a-f0-9-]+)$/i;
    const match = customLinkRegex.exec(href);
    if (!match) {
      // Not a custom link, open in new tab
      window.open(href, '_blank', 'noopener,noreferrer');
      return;
    }
    
    const [, type, id] = match;
    
    // Validate that ID is not empty
    if (id.trim().length === 0) {
      console.error('[AI Chatbot] Empty ID in custom link:', href);
      return;
    }
    
    // Check if ID is UUID format (for warning only)
    const isUUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(id);
    if (!isUUID) {
      console.warn('[AI Chatbot] ID is not in UUID format (may cause API error):', id);
    }
    
    // Clear all other modal states to prevent conflicts, then set the new one
    setViewingAccountId(null);
    setViewingContactId(null);
    setViewingTaskId(null);
    setViewingVisitReportId(null);
    setViewingDealId(null);
    
    // Set the appropriate modal state based on type
    switch (type) {
      case 'account':
        setViewingAccountId(id);
        break;
      case 'contact':
        setViewingContactId(id);
        break;
      case 'task':
        setViewingTaskId(id);
        break;
      case 'visit':
        setViewingVisitReportId(id);
        break;
      case 'deal':
        setViewingDealId(id);
        break;
      default:
        // Unknown type, open in new tab
        window.open(href, '_blank', 'noopener,noreferrer');
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Note: Custom links are now rendered as <span> elements, so no document-level listener needed
  // The onClick handler in the span component will handle clicks directly

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSend = () => {
    if (!input.trim() || isPending || !settings.enabled) return;

    const userMessage: Message = {
      id: generateMessageId(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");

    // Prepare conversation history (exclude the initial greeting and current message)
    const conversationHistory = messages
      .filter((msg) => msg.id !== "initial-greeting") // Exclude initial greeting
      .map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

    const modelToUse = selectedModel || settings.model || undefined;
    
    // Log model being sent
    console.log("=== AI REQUEST DEBUG ===");
    console.log("Selected model from UI:", selectedModel);
    console.log("Model from settings:", settings.model);
    console.log("Model being sent:", modelToUse);
    console.log("User message:", currentInput);
    console.log("=========================");

    sendMessage(
      {
        message: currentInput,
        conversation_history: conversationHistory.length > 0 ? conversationHistory : undefined,
        model: modelToUse,
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
          console.log("Tokens used:", response.data.tokens);
          console.log("=========================");

          const assistantMessage: Message = {
            id: generateMessageId(),
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
            id: generateMessageId(),
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

  const handleCopyChat = () => {
    const chatText = messages
      .map((msg) => {
        const role = msg.role === "user" ? "User" : "Assistant";
        return `${role}: ${msg.content}`;
      })
      .join("\n\n");
    navigator.clipboard.writeText(chatText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Custom components for markdown rendering with explicit table styling
  const markdownComponents: Components = {
    // Headings
    h1: ({ children, ...props }) => (
      <h1 className="text-lg font-bold mb-2 mt-4 first:mt-0" {...props}>
        {children}
      </h1>
    ),
    h2: ({ children, ...props }) => (
      <h2 className="text-base font-semibold mb-2 mt-3 first:mt-0" {...props}>
        {children}
      </h2>
    ),
    h3: ({ children, ...props }) => (
      <h3 className="text-sm font-semibold mb-1 mt-2 first:mt-0" {...props}>
        {children}
      </h3>
    ),
    // Paragraphs
    p: ({ children, ...props }) => (
      <p className="text-sm leading-relaxed mb-2 last:mb-0" {...props}>
        {children}
      </p>
    ),
    // Lists
    ul: ({ children, ...props }) => (
      <ul className="list-disc list-outside space-y-1.5 my-3 ml-6" {...props}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }) => (
      <ol className="list-decimal list-outside space-y-1.5 my-3 ml-6" {...props}>
        {children}
      </ol>
    ),
    li: ({ children, ...props }) => (
      <li className="text-sm leading-relaxed pl-1" {...props}>
        {children}
      </li>
    ),
    // Strong and emphasis
    strong: ({ children, ...props }) => (
      <strong className="font-semibold" {...props}>
        {children}
      </strong>
    ),
    em: ({ children, ...props }) => (
      <em className="italic" {...props}>
        {children}
      </em>
    ),
    // Links - handle custom type://ID format (fallback for non-assistant messages)
    a: ({ children, href, node, ...props }) => {
      const nodeHref = (node as { properties?: { href?: string } })?.properties?.href;
      const actualHref = href || nodeHref || "";
      
      // Match custom link format: type://uuid (UUID with hyphens)
      const customLinkRegex = /^\w+:\/\/[a-f0-9-]+$/i;
      const isCustomLink = actualHref ? customLinkRegex.test(actualHref) : false;
      
      // For custom links, use button styled as link
      if (isCustomLink && actualHref) {
        return (
          <button
            type="button"
            className="text-primary underline hover:no-underline cursor-pointer bg-transparent border-none p-0 font-inherit inline text-left"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleLinkClick(e as unknown as React.MouseEvent<HTMLAnchorElement>, actualHref);
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            title={actualHref}
            data-custom-link={actualHref}
          >
            {children}
          </button>
        );
      }
      
      // Regular links
      return (
        <a 
          href={actualHref || "#"} 
          className="text-primary underline hover:no-underline cursor-pointer" 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (actualHref && !actualHref.startsWith('#') && !actualHref.startsWith('http')) {
              window.open(actualHref, '_blank', 'noopener,noreferrer');
            } else if (actualHref && actualHref.startsWith('http')) {
              window.open(actualHref, '_blank', 'noopener,noreferrer');
            }
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          {...props}
        >
          {children}
        </a>
      );
    },
    // Code
    code: ({ children, className, ...props }) => {
      const isInline = !className?.includes('language-');
      return isInline ? (
        <code className="text-xs bg-muted/50 px-1.5 py-0.5 rounded font-mono" {...props}>
          {children}
        </code>
      ) : (
        <code className="block text-xs bg-muted/50 p-3 rounded font-mono overflow-x-auto" {...props}>
          {children}
        </code>
      );
    },
    // Tables
    table: ({ children, ...props }) => (
      <div className="overflow-x-auto my-4 -mx-2">
        <table 
          className="w-full text-sm border-collapse" 
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
    // Blockquote
    blockquote: ({ children, ...props }) => (
      <blockquote 
        className="border-l-2 border-muted-foreground/30 pl-3 italic my-2" 
        {...props}
      >
        {children}
      </blockquote>
    ),
  };

  if (!settings.enabled) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <p className="text-muted-foreground text-sm">
          AI Assistant is disabled. Please enable it in settings.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-background relative min-h-0 overflow-hidden">
      {/* Top Bar - Fixed at top */}
      <div className="sticky top-0 z-10 border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 shrink-0">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                setMessages([{
                  id: "initial-greeting",
                  role: "assistant",
                  content: "Hello! How can I help you today?",
                  timestamp: new Date(),
                }]);
                setInput("");
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <div className="h-6 w-px bg-border" />
            <Select
              value={selectedModel || settings.model || ""}
              onValueChange={setUserSelectedModel}
              disabled={isPending}
            >
              <SelectTrigger className="h-8 border-0 bg-transparent hover:bg-muted/50 px-2 text-sm font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="llama-3.1-8b">Llama 3.1 8B</SelectItem>
                <SelectItem value="llama-3.1-70b">Llama 3.1 70B</SelectItem>
                <SelectItem value="llama-3-8b">Llama 3 8B</SelectItem>
                <SelectItem value="llama-3-70b">Llama 3 70B</SelectItem>
                <SelectItem value="gpt-4">GPT-4</SelectItem>
                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-1" align="end">
                <div className="flex flex-col">
                  <button
                    onClick={handleCopyChat}
                    className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors text-left"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 text-green-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy conversation
                      </>
                    )}
                  </button>
                  <button className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors text-left">
                    <Settings className="h-4 w-4" />
                    Settings
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Messages Area - Scrollable with proper spacing */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto w-full overscroll-contain"
        style={{ 
          scrollBehavior: 'smooth',
          paddingBottom: '1rem'
        }}
      >
        {messages.length === 1 && messages[0].id === "initial-greeting" ? (
          // Empty state - centered welcome message
          <div className="flex flex-col items-center justify-center min-h-full px-4 py-12">
            <div className="max-w-2xl w-full space-y-8">
              <div className="text-center space-y-3">
                <h1 className="text-4xl font-semibold bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  AI Assistant
                </h1>
                <p className="text-muted-foreground text-lg">
                  Chat with AI assistant to get insights and answers about your CRM data
                </p>
              </div>
            </div>
          </div>
        ) : (
          // Messages list
          <div className="flex flex-col w-full">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`group w-full transition-colors ${
                  message.role === "user" ? "bg-muted/20" : "bg-background"
                }`}
              >
                <div className="flex gap-4 px-4 py-6 max-w-3xl mx-auto">
                  {/* Avatar/Icon */}
                  <div className="shrink-0 w-8 h-8 mt-1">
                    {message.role === "user" && userAvatarUrl && (
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={userAvatarUrl} alt={user?.name || "User"} />
                      </Avatar>
                    )}
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-foreground"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  {/* Message Content */}
                  <div className="flex-1 min-w-0 wrap-break-word">
                    {message.role === "assistant" ? (
                      <div className="markdown-content prose prose-sm dark:prose-invert max-w-none prose-headings:mt-4 prose-headings:mb-2 prose-p:my-2">
                        {(() => {
                          // Extract custom links from markdown before rendering
                          const customLinks = extractCustomLinks(message.content);
                          
                          // Create markdownComponents with access to customLinks
                          const componentsWithLinks: Components = {
                            ...markdownComponents,
                            a: ({ children, href, node, ...props }) => {
                              // Get link text from children
                              const linkText = typeof children === 'string' 
                                ? children 
                                : Array.isArray(children) 
                                  ? children.map(c => typeof c === 'string' ? c : '').join('')
                                  : '';
                              
                              // Check if this link text exists in our custom links map
                              const customHref = customLinks.get(linkText);
                              const actualHref = customHref || href || (node as { properties?: { href?: string } })?.properties?.href || "";
                              
                              // Match custom link format: type://uuid (UUID with hyphens)
                              const customLinkRegex = /^\w+:\/\/[a-f0-9-]+$/i;
                              const isCustomLink = actualHref ? customLinkRegex.test(actualHref) : false;
                              
                              // For custom links, use button styled as link
                              if (isCustomLink && actualHref) {
                                return (
                                  <button
                                    type="button"
                                    className="text-primary underline hover:no-underline cursor-pointer bg-transparent border-none p-0 font-inherit inline text-left"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleLinkClick(e as unknown as React.MouseEvent<HTMLAnchorElement>, actualHref);
                                    }}
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                    }}
                                    title={actualHref}
                                    data-custom-link={actualHref}
                                  >
                                    {children}
                                  </button>
                                );
                              }
                              
                              // Regular links
                              return (
                                <a 
                                  href={actualHref || "#"} 
                                  className="text-primary underline hover:no-underline cursor-pointer" 
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (actualHref && !actualHref.startsWith('#') && !actualHref.startsWith('http')) {
                                      window.open(actualHref, '_blank', 'noopener,noreferrer');
                                    } else if (actualHref && actualHref.startsWith('http')) {
                                      window.open(actualHref, '_blank', 'noopener,noreferrer');
                                    }
                                  }}
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                  }}
                                  {...props}
                                >
                                  {children}
                                </a>
                              );
                            },
                          };
                          
                          return (
                            <ReactMarkdown 
                              remarkPlugins={[remarkGfm]}
                              components={componentsWithLinks}
                              onError={(error) => {
                                console.error('ReactMarkdown error:', error);
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          );
                        })()}
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap wrap-break-word">
                        {message.content}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isPending && (
              <div className="group w-full bg-background animate-pulse">
                <div className="flex gap-4 px-4 py-6 max-w-3xl mx-auto">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center mt-1">
                    <svg
                      className="w-5 h-5 text-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input Area - Fixed at bottom, always visible */}
      <div className="sticky bottom-0 z-10 border-t border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.3)]">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="relative flex items-center gap-2">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything..."
                className="w-full resize-none rounded-2xl border border-border bg-background px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed min-h-[52px] max-h-[200px] leading-relaxed shadow-sm"
                disabled={isPending || !settings.enabled}
                rows={1}
              />
            </div>
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isPending || !settings.enabled}
              size="icon"
              className="h-[52px] w-[52px] rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 shrink-0 shadow-md"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2.5 px-4">
            AI Assistant can make mistakes. Check important info.
          </p>
        </div>
      </div>

      {/* Detail Modals/Drawers - Use key prop to force remount when ID changes, ensuring fresh data fetch */}
      {viewingAccountId && (
        <AccountDetailModal
          key={`account-${viewingAccountId}`}
          accountId={viewingAccountId}
          open={!!viewingAccountId}
          onOpenChange={(open) => {
            if (!open) {
              setViewingAccountId(null);
            }
          }}
        />
      )}

      {viewingContactId && (
        <ContactDetailModal
          key={`contact-${viewingContactId}`}
          contactId={viewingContactId}
          open={!!viewingContactId}
          onOpenChange={(open) => {
            if (!open) {
              setViewingContactId(null);
            }
          }}
        />
      )}

      {viewingTaskId && (
        <TaskDetailModal
          key={`task-${viewingTaskId}`}
          taskId={viewingTaskId}
          open={!!viewingTaskId}
          onOpenChange={(open) => {
            if (!open) {
              setViewingTaskId(null);
            }
          }}
        />
      )}

      {viewingVisitReportId && (
        <VisitReportDetailModal
          key={`visit-${viewingVisitReportId}`}
          visitReportId={viewingVisitReportId}
          open={!!viewingVisitReportId}
          onOpenChange={(open) => {
            if (!open) {
              setViewingVisitReportId(null);
            }
          }}
        />
      )}

      {viewingDealId && (
        <DealDetailModal
          key={`deal-${viewingDealId}`}
          dealId={viewingDealId}
          open={!!viewingDealId}
          onOpenChange={(open) => {
            if (!open) {
              setViewingDealId(null);
            }
          }}
        />
      )}
    </div>
  );
}
