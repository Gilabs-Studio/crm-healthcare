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
import { LeadDetailModal } from "@/features/sales-crm/lead-management/components/lead-detail-modal";
import { templateCategories, getTemplatesByCategory, type ChatTemplate } from "../data/chat-templates";

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

  // Template selector state
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // State for detail modals/drawers
  const [viewingAccountId, setViewingAccountId] = useState<string | null>(null);
  const [viewingContactId, setViewingContactId] = useState<string | null>(null);
  const [viewingTaskId, setViewingTaskId] = useState<string | null>(null);
  const [viewingVisitReportId, setViewingVisitReportId] = useState<string | null>(null);
  const [viewingDealId, setViewingDealId] = useState<string | null>(null);
  const [viewingLeadId, setViewingLeadId] = useState<string | null>(null);

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
    setViewingLeadId(null);
    
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
      case 'lead':
        setViewingLeadId(id);
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

  const handleSelectTemplate = (template: ChatTemplate) => {
    setInput(template.content);
    // Focus input after selecting template
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const filteredTemplates = useMemo(() => {
    return getTemplatesByCategory(selectedCategory);
  }, [selectedCategory]);

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
    <div className="flex flex-col h-full w-full bg-background relative min-h-0">
      {/* Messages Area - Full height with bottom padding for fixed input */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto w-full overscroll-contain pb-52"
        style={{ 
          scrollBehavior: 'smooth'
        }}
      >
        {messages.length === 1 && messages[0].id === "initial-greeting" ? (
          // Empty state - Modern minimalist welcome
          <div className="flex flex-col items-center justify-center min-h-full px-6 py-16">
            <div className="max-w-4xl w-full space-y-10">
              {/* Welcome Message */}
              <div className="text-center space-y-4">
                <h1 className="text-4xl font-semibold text-foreground tracking-tight">
                  AI Assistant
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Ask questions, get insights, and explore your CRM data
                </p>
              </div>

              {/* Template Selector */}
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-medium text-foreground">Quick Templates</h2>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[180px] border-border/50 rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {templateCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Template Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[450px] overflow-y-auto pr-2 scrollbar-thin">
                  {filteredTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleSelectTemplate(template)}
                      className="group relative text-left p-5 rounded-xl border border-border bg-card hover:bg-accent/5 hover:border-primary/40 hover:shadow-sm transition-all duration-200"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                            {template.name}
                          </h3>
                          <span className="text-xs text-muted-foreground px-2 py-1 rounded-md bg-muted/70 shrink-0">
                            {template.category}
                          </span>
                        </div>
                        {template.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {template.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground/90 font-mono bg-muted/40 px-3 py-2 rounded-lg line-clamp-2 leading-relaxed">
                          {template.content}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                {filteredTemplates.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="text-sm">No templates found in this category.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          // Messages list - Clean modern layout with proper bottom spacing
          <div className="flex flex-col w-full">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`group w-full ${
                  message.role === "user" ? "bg-muted/10" : "bg-background"
                }`}
              >
                <div className="flex gap-5 px-6 py-8 max-w-4xl mx-auto">
                  {/* Avatar/Icon */}
                  <div className="shrink-0 w-9 h-9 mt-0.5">
                    {message.role === "user" && userAvatarUrl && (
                      <Avatar className="w-9 h-9 ring-2 ring-border">
                        <AvatarImage src={userAvatarUrl} alt={user?.name || "User"} />
                      </Avatar>
                    )}
                    {message.role === "assistant" && (
                      <div className="w-9 h-9 rounded-full bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center ring-2 ring-primary/10">
                        <svg
                          className="w-5 h-5 text-primary"
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
                  <div className="flex-1 min-w-0">
                    {message.role === "assistant" ? (
                      <div className="markdown-content prose prose-sm dark:prose-invert max-w-none prose-headings:mt-5 prose-headings:mb-3 prose-p:my-3 prose-p:leading-relaxed">
                        {(() => {
                          const customLinks = extractCustomLinks(message.content);
                          
                          const componentsWithLinks: Components = {
                            ...markdownComponents,
                            a: ({ children, href, node, ...props }) => {
                              const linkText = typeof children === 'string' 
                                ? children 
                                : Array.isArray(children) 
                                  ? children.map(c => typeof c === 'string' ? c : '').join('')
                                  : '';
                              
                              const customHref = customLinks.get(linkText);
                              const actualHref = customHref || href || (node as { properties?: { href?: string } })?.properties?.href || "";
                              
                              const customLinkRegex = /^\w+:\/\/[a-f0-9-]+$/i;
                              const isCustomLink = actualHref ? customLinkRegex.test(actualHref) : false;
                              
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
                            >
                              {message.content}
                            </ReactMarkdown>
                          );
                        })()}
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                        {message.content}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isPending && (
              <div className="group w-full bg-background">
                <div className="flex gap-5 px-6 py-8 max-w-4xl mx-auto">
                  <div className="shrink-0 w-9 h-9 rounded-full bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center ring-2 ring-primary/10 mt-0.5">
                    <svg
                      className="w-5 h-5 text-primary"
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
                  <div className="flex-1 flex items-center gap-3">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input Area - Fixed at bottom with integrated controls like ChatGPT */}
      <div className="fixed bottom-0 left-0 right-0 z-20">
        <div className="max-w-4xl mx-auto px-6 py-5">
          {/* Model Selector & Actions - Above textarea */}
          <div className="flex items-center justify-between mb-3 px-1">
            <Select
              value={selectedModel || settings.model || ""}
              onValueChange={setUserSelectedModel}
              disabled={isPending}
            >
              <SelectTrigger className="h-8 w-auto border-0 bg-transparent hover:bg-muted/50 px-2 py-0 text-xs font-medium rounded-lg gap-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="start">
                <SelectItem value="llama-3.1-8b">Llama 3.1 8B</SelectItem>
                <SelectItem value="llama-3.1-70b">Llama 3.1 70B</SelectItem>
                <SelectItem value="llama-3-8b">Llama 3 8B</SelectItem>
                <SelectItem value="llama-3-70b">Llama 3 70B</SelectItem>
                <SelectItem value="gpt-4">GPT-4</SelectItem>
                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-muted/60">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-52 p-2" align="end">
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => {
                        setMessages([{
                          id: "initial-greeting",
                          role: "assistant",
                          content: "Hello! How can I help you today?",
                          timestamp: new Date(),
                        }]);
                        setInput("");
                      }}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-muted transition-colors text-left"
                    >
                      <Plus className="h-4 w-4" />
                      <span>New conversation</span>
                    </button>
                    <button
                      onClick={handleCopyChat}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-muted transition-colors text-left"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 text-primary" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          <span>Copy conversation</span>
                        </>
                      )}
                    </button>
                    <button className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-muted transition-colors text-left">
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Textarea & Send Button */}
          <div className="relative flex items-end gap-3">
            <div className="flex-1 relative min-w-0">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything..."
                className="w-full resize-none rounded-2xl border border-border bg-card px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed min-h-14 max-h-40 leading-relaxed placeholder:text-muted-foreground/60 transition-all shadow-lg"
                disabled={isPending || !settings.enabled}
                rows={1}
              />
            </div>
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isPending || !settings.enabled}
              size="icon"
              className="h-14 w-14 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-95 shrink-0 shadow-lg"
            >
              {isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
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

      {viewingLeadId && (
        <LeadDetailModal
          key={`lead-${viewingLeadId}`}
          leadId={viewingLeadId}
          open={!!viewingLeadId}
          onOpenChange={(open) => {
            if (!open) {
              setViewingLeadId(null);
            }
          }}
        />
      )}
    </div>
  );
}
