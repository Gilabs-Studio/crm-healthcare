"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import type { WebSocketMessage, Notification } from "../types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const WS_URL = API_BASE_URL.replace(/^http/, "ws");

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const isConnectingRef = useRef(false);
  const queryClient = useQueryClient();
  const queryClientRef = useRef(queryClient);
  const { token } = useAuthStore();
  const tokenRef = useRef<string | null>(token);

  // Update refs when values change
  useEffect(() => {
    tokenRef.current = token;
    queryClientRef.current = queryClient;
  }, [token, queryClient]);

  useEffect(() => {
    // Don't connect if no token
    if (!token) {
      // Close connection if token is removed
      if (wsRef.current) {
        wsRef.current.close(1000, "Token removed");
        wsRef.current = null;
      }
      return;
    }

    // Don't connect if already connecting
    if (isConnectingRef.current) {
      return;
    }

    // Don't reconnect if already connected and token is the same
    if (
      wsRef.current &&
      (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) &&
      tokenRef.current === token
    ) {
      return;
    }

    // Close existing connection if token changed or connection is in wrong state
    if (wsRef.current) {
      if (tokenRef.current !== token) {
        // Token changed, close old connection
        wsRef.current.close(1000, "Token changed");
      } else if (wsRef.current.readyState === WebSocket.CLOSED || wsRef.current.readyState === WebSocket.CLOSING) {
        // Connection is closed/closing, clear ref
        wsRef.current = null;
      } else {
        // Connection exists and is open/connecting with same token, don't create new one
        return;
      }
    }

    isConnectingRef.current = true;
    // Reset reconnect attempts on new connection attempt
    if (wsRef.current === null) {
      reconnectAttemptsRef.current = 0;
    }

    // Build WebSocket URL with token
    const wsUrl = `${WS_URL}/api/v1/ws/notifications?token=${encodeURIComponent(token)}`;

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("WebSocket connected");
        isConnectingRef.current = false;
        reconnectAttemptsRef.current = 0;
        
        // Clear any pending reconnect
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);

          switch (message.type) {
            case "notification.created": {
              const notification = message.data as Notification;
              
              // Invalidate queries to refresh data
              queryClientRef.current.invalidateQueries({ queryKey: ["notifications"] });
              queryClientRef.current.invalidateQueries({ queryKey: ["notifications", "unread-count"] });

              // Show toast notification
              toast.info(notification.title, {
                description: notification.message,
                duration: 5000,
              });
              break;
            }

            case "notification.updated": {
              // Invalidate queries to refresh data
              queryClientRef.current.invalidateQueries({ queryKey: ["notifications"] });
              queryClientRef.current.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
              break;
            }

            case "notification.deleted": {
              // Invalidate queries to refresh data
              queryClientRef.current.invalidateQueries({ queryKey: ["notifications"] });
              queryClientRef.current.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
              break;
            }

            default:
              console.warn("Unknown WebSocket message type:", message.type);
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        isConnectingRef.current = false;
      };

      ws.onclose = (event) => {
        console.log("WebSocket disconnected", event.code, event.reason);
        isConnectingRef.current = false;
        wsRef.current = null;

        // Only reconnect if not a normal closure (1000) and we have a token
        // Don't reconnect if it was closed intentionally (code 1000)
        if (event.code !== 1000 && tokenRef.current) {
          // Exponential backoff: 1s, 2s, 4s, 8s, max 30s
          const maxAttempts = 5;
          if (reconnectAttemptsRef.current < maxAttempts) {
            reconnectAttemptsRef.current += 1;
            const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current - 1), 30000);
            
            reconnectTimeoutRef.current = setTimeout(() => {
              console.log(`Attempting to reconnect WebSocket... (attempt ${reconnectAttemptsRef.current})`);
              // Manually reconnect - create new WebSocket connection
              const currentToken = tokenRef.current;
              if (currentToken && !wsRef.current && !isConnectingRef.current) {
                isConnectingRef.current = true;
                const reconnectWs = new WebSocket(`${WS_URL}/api/v1/ws/notifications?token=${encodeURIComponent(currentToken)}`);
                
                reconnectWs.onopen = () => {
                  console.log("WebSocket reconnected");
                  isConnectingRef.current = false;
                  reconnectAttemptsRef.current = 0;
                  if (reconnectTimeoutRef.current) {
                    clearTimeout(reconnectTimeoutRef.current);
                    reconnectTimeoutRef.current = null;
                  }
                };

                reconnectWs.onmessage = ws.onmessage;
                reconnectWs.onerror = (error) => {
                  console.error("WebSocket reconnection error:", error);
                  isConnectingRef.current = false;
                };
                reconnectWs.onclose = ws.onclose; // Reuse same close handler
                
                wsRef.current = reconnectWs;
              }
            }, delay);
          } else {
            console.warn("Max reconnection attempts reached. Stopping reconnection.");
          }
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
      isConnectingRef.current = false;
    }

    return () => {
      // Cleanup on unmount or token change
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (wsRef.current) {
        // Only close if token changed or unmounting
        if (tokenRef.current !== token || !token) {
          wsRef.current.close(1000, "Token changed or component unmounting");
        }
        wsRef.current = null;
      }
      isConnectingRef.current = false;
    };
  }, [token]); // Removed queryClient from dependencies to prevent unnecessary reconnects
}

