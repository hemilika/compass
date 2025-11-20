import { memo, useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search as SearchIcon, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSearch, useThreads } from "@/hooks/api";
import type { SearchQueryParams } from "@/types/api";
import { formatTimeAgo } from "@/lib/date-utils";

interface SearchProps {
  onClose?: () => void;
}

const SearchComponent = memo(({ onClose }: SearchProps) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [selectedThreadId, setSelectedThreadId] = useState<number | undefined>(
    undefined
  );
  const [searchParams, setSearchParams] = useState<SearchQueryParams | null>(
    null
  );
  const { data: threads } = useThreads();

  const { data: searchResults, isLoading } = useSearch(
    searchParams || { query: "", sort: "relevance", page: 1, limit: 10 },
    !!searchParams && searchParams.query.trim().length > 0
  );

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = useCallback(() => {
    if (!query.trim()) {
      setSearchParams(null);
      return;
    }
    setSearchParams({
      query: query.trim(),
      sort: "relevance",
      page: 1,
      limit: 10,
      threadId: selectedThreadId,
    });
  }, [query, selectedThreadId]);

  // Debounced search - triggers after 1.5 seconds of no typing
  useEffect(() => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // If query is empty, clear search immediately
    if (!query.trim()) {
      setSearchParams(null);
      return;
    }

    // Set new timer for debounced search
    debounceTimerRef.current = setTimeout(() => {
      handleSearch();
    }, 1500); // 1.5 seconds delay

    // Cleanup function
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, selectedThreadId, handleSearch]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        // Clear debounce timer when Enter is pressed
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        handleSearch();
      } else if (e.key === "Escape") {
        // Clear debounce timer when Escape is pressed
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        onClose?.();
      }
    },
    [handleSearch, onClose]
  );

  const handleResultClick = useCallback(
    (result: { type: string; postId: number; id: string }) => {
      if (result.type === "post") {
        navigate({ to: `/posts/${result.postId}` });
      } else {
        navigate({ to: `/posts/${result.postId}` });
      }
      onClose?.();
    },
    [navigate, onClose]
  );

  const results = useMemo(() => searchResults?.results || [], [searchResults]);

  return (
    <div className="relative w-full max-w-2xl">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search posts and replies..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-10 pr-10"
            autoFocus
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                setSearchParams(null);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button onClick={handleSearch} disabled={!query.trim() || isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
        </Button>
      </div>
      <div className="mt-2">
        <Select
          value={selectedThreadId?.toString() || "all"}
          onValueChange={(value) => {
            setSelectedThreadId(value === "all" ? undefined : Number(value));
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Filter by hive (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Hives</SelectItem>
            {threads?.map((thread) => (
              <SelectItem key={thread.id} value={thread.id.toString()}>
                {thread.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {searchParams && searchParams.query && (
        <Card className="absolute z-50 mt-2 w-full shadow-lg">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : results.length > 0 ? (
              <div className="max-h-96 overflow-y-auto">
                <div className="p-2 text-xs text-muted-foreground">
                  {searchResults?.total} result
                  {searchResults?.total !== 1 ? "s" : ""} found
                </div>
                {results.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className="w-full text-left"
                    type="button"
                  >
                    <div className="border-b p-4 transition-colors hover:bg-accent">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="mb-1 flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {result.type}
                            </Badge>
                            {result.threadName && (
                              <span className="text-xs text-muted-foreground truncate">
                                in {result.threadName}
                              </span>
                            )}
                          </div>
                          {result.title && (
                            <h4 className="mb-1 font-semibold line-clamp-1">
                              {result.title}
                            </h4>
                          )}
                          <p
                            className="text-sm text-muted-foreground line-clamp-2"
                            dangerouslySetInnerHTML={{ __html: result.snippet }}
                          />
                          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                            <span>👍 {result.score}</span>
                            <span>•</span>
                            <span>{formatTimeAgo(result.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
                {searchResults && searchResults.total > searchResults.limit && (
                  <div className="p-3 text-center text-sm text-muted-foreground">
                    Showing {results.length} of {searchResults.total} results
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No results found for &quot;{searchParams?.query}&quot;
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
});

SearchComponent.displayName = "Search";

export { SearchComponent as Search };
