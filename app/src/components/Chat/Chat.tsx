import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAiSearch } from "@/hooks/api";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "@tanstack/react-router";
import type { AiSearchResponse } from "@/types/api";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  sources?: AiSearchResponse["sources"];
  suggestedFollowups?: string[];
  timestamp: Date;
}

export const Chat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const aiSearchMutation = useAiSearch();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    // Use requestAnimationFrame to ensure DOM is updated
    requestAnimationFrame(() => {
      // Find the ScrollArea viewport element
      const viewport = document.querySelector(
        "[data-radix-scroll-area-viewport]"
      ) as HTMLDivElement | null;
      if (viewport) {
        scrollViewportRef.current = viewport;
        viewport.scrollTo({
          top: viewport.scrollHeight,
          behavior: "smooth",
        });
      }
      // Fallback to scrollIntoView
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({
            behavior: "smooth",
            block: "end",
            inline: "nearest",
          });
        }
      }, 50);
    });
  };

  // Find ScrollArea viewport when chat opens
  useEffect(() => {
    if (isOpen) {
      const findViewport = () => {
        const viewport = document.querySelector(
          "[data-radix-scroll-area-viewport]"
        ) as HTMLDivElement | null;
        if (viewport) {
          scrollViewportRef.current = viewport;
        }
      };
      // Try immediately and after a delay
      findViewport();
      const timeoutId = setTimeout(findViewport, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        scrollToBottom();
        inputRef.current?.focus();
      }, 200);
    }
  }, [isOpen]);

  useEffect(() => {
    // Scroll to bottom when messages change (new message added or loading state changes)
    if (isOpen && (messages.length > 0 || isLoading)) {
      // Delay slightly to allow DOM to update
      const timeoutId = setTimeout(() => {
        scrollToBottom();
      }, 150);
      return () => clearTimeout(timeoutId);
    }
  }, [messages.length, isLoading, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !isAuthenticated) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Build conversation history from previous messages
      const conversationHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Add current message to history
      conversationHistory.push({
        role: "user",
        content: userMessage.content,
      });

      const response = await aiSearchMutation.mutateAsync({
        query: userMessage.content,
        conversationHistory,
      });

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: response.answer,
        sources: response.sources,
        suggestedFollowups: response.suggestedFollowups,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      // Error is handled by the mutation hook (toast)
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestedFollowup = (followup: string) => {
    setInput(followup);
    inputRef.current?.focus();
  };

  const handleSourceClick = (source: AiSearchResponse["sources"][0]) => {
    navigate({ to: `/posts/${source.postId}` });
    setIsOpen(false);
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50",
          "bg-primary hover:bg-primary/90 text-primary-foreground",
          "transition-all duration-200",
          isOpen && "scale-90"
        )}
        size="icon"
        aria-label="Open chat"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-[28rem] max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-8rem)] shadow-2xl z-50 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b shrink-0 min-w-0">
            <CardTitle className="text-lg font-semibold truncate min-w-0">
              AI Assistant
            </CardTitle>
            <div className="flex items-center gap-2 shrink-0">
              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearChat}
                  className="h-8 text-xs"
                >
                  Clear
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0 overflow-hidden min-h-0">
            {/* Messages Area */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <ScrollArea className="h-full px-4 py-4">
                <div>
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                      <MessageCircle className="h-12 w-12 mb-4 opacity-50" />
                      <p className="text-sm">
                        Ask me anything about posts, replies, or discussions!
                      </p>
                      <p className="text-xs mt-2">
                        I can help you find information and answer questions.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message, index) => (
                        <div
                          key={index}
                          className={cn(
                            "flex flex-col gap-2",
                            message.role === "user"
                              ? "items-end"
                              : "items-start"
                          )}
                        >
                          <div
                            className={cn(
                              "rounded-lg px-4 py-2 max-w-[85%] wrap-break-word overflow-wrap-anywhere",
                              message.role === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-foreground"
                            )}
                          >
                            <div
                              className="text-sm whitespace-pre-wrap [&_a]:text-primary [&_a]:hover:underline [&_a]:cursor-pointer"
                              dangerouslySetInnerHTML={{
                                __html: message.content.replace(
                                  /<a href=['"]([^'"]+)['"]/g,
                                  (match, url) => {
                                    // Convert relative URLs to clickable links that navigate
                                    if (url.startsWith("/posts/")) {
                                      const postId = url
                                        .split("/posts/")[1]
                                        .split("#")[0];
                                      return `<a href="#" class="text-primary hover:underline" data-post-id="${postId}"`;
                                    }
                                    return match;
                                  }
                                ),
                              }}
                              onClick={(e) => {
                                const target = e.target as HTMLElement;
                                const link = target.closest("a[data-post-id]");
                                if (link) {
                                  e.preventDefault();
                                  const postId =
                                    link.getAttribute("data-post-id");
                                  if (postId) {
                                    navigate({ to: `/posts/${postId}` });
                                    setIsOpen(false);
                                  }
                                }
                              }}
                            />
                          </div>

                          {/* Sources */}
                          {message.sources && message.sources.length > 0 && (
                            <div className="w-full max-w-[85%] space-y-2 mt-2">
                              <p className="text-xs font-semibold text-muted-foreground">
                                Sources:
                              </p>
                              {message.sources.slice(0, 3).map((source) => (
                                <button
                                  key={source.id}
                                  onClick={() => handleSourceClick(source)}
                                  className="w-full text-left p-2 rounded-md border bg-card hover:bg-accent transition-colors group min-w-0"
                                >
                                  <div className="flex items-start justify-between gap-2 min-w-0">
                                    <div className="flex-1 min-w-0 overflow-hidden">
                                      <div className="flex items-center gap-2 mb-1">
                                        <Badge
                                          variant="secondary"
                                          className="text-xs shrink-0"
                                        >
                                          {source.type}
                                        </Badge>
                                        {source.threadName && (
                                          <span className="text-xs text-muted-foreground truncate">
                                            in {source.threadName}
                                          </span>
                                        )}
                                      </div>
                                      {source.title && (
                                        <p className="text-sm font-medium line-clamp-1 group-hover:text-primary truncate">
                                          {source.title}
                                        </p>
                                      )}
                                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1 wrap-break-word">
                                        {source.snippet}
                                      </p>
                                    </div>
                                    <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0 mt-1" />
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Suggested Followups */}
                          {message.suggestedFollowups &&
                            message.suggestedFollowups.length > 0 && (
                              <div className="w-full max-w-[85%] space-y-1 mt-2">
                                <p className="text-xs font-semibold text-muted-foreground">
                                  Suggested questions:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {message.suggestedFollowups
                                    .slice(0, 3)
                                    .map((followup, idx) => (
                                      <Button
                                        key={idx}
                                        variant="outline"
                                        size="sm"
                                        className="text-xs h-auto py-1 px-2 wrap-break-word max-w-[calc(100%-0.5rem)] min-w-0"
                                        onClick={() =>
                                          handleSuggestedFollowup(followup)
                                        }
                                      >
                                        <span className="wrap-break-word whitespace-normal text-left">
                                          {followup}
                                        </span>
                                      </Button>
                                    ))}
                                </div>
                              </div>
                            )}

                          <span className="text-xs text-muted-foreground">
                            {message.timestamp.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      ))}
                      {isLoading && (
                        <div className="flex items-start gap-2">
                          <div className="bg-muted rounded-lg px-4 py-2">
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Input Area */}
            <div className="border-t p-4 shrink-0">
              <div className="flex gap-2 min-w-0">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a question..."
                  disabled={isLoading}
                  className="flex-1 min-w-0"
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};
