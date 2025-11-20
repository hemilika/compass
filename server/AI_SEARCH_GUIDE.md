# AI-Powered Search Integration Guide

## Overview

The AI search feature uses OpenAI's GPT-4 to provide conversational, context-aware search capabilities. Users can ask natural language questions and receive intelligent answers with **clickable HTML links** to relevant posts and replies.

### 🔗 Key Feature: HTML Response Format

The AI response includes **HTML anchor tags** that you can render directly in your frontend:

- Post links: `<a href="/posts/{id}" class="post-link" data-post-id="{id}">{Title}</a>`
- Reply links: `<a href="/posts/{post_id}#reply-{id}" class="reply-link" data-reply-id="{id}">this reply</a>`

This allows for rich, interactive answers where users can click directly on mentioned posts/replies!

## Setup Instructions

### 1. Add Environment Variables

Add these variables to your `.env` file:

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_MODEL=gpt-5-nano
```

**Get your API key:** https://platform.openai.com/api-keys

### 2. Restart the Server

```bash
npm run start:dev
```

## API Endpoint

### POST `/search/ai`

Performs an AI-powered conversational search.

**Authentication:** Required (JWT Bearer token)

**Request Body:**

```typescript
{
  query: string;                    // Required: User's search query (max 500 chars)
  conversationHistory?: Array<{     // Optional: Previous conversation context
    role: 'user' | 'assistant';
    content: string;
  }>;
  buId?: string;                    // Optional: Filter by Business Unit ID
  threadId?: string;                // Optional: Filter by Thread ID
}
```

**Response:**

```typescript
{
  answer: string;                   // AI-generated answer with HTML links to posts/replies
  sources: Array<{
    id: string;                     // e.g., "post_123" or "reply_456"
    type: 'post' | 'reply';
    postId: number;
    threadId: number | null;
    threadName: string | null;
    buId: number | null;
    buName: string | null;
    title?: string;                 // Only for posts
    snippet: string;                // Excerpt (150 chars)
    url: string;                    // Direct link: /posts/{id} or /posts/{id}#reply-{id}
    authorName: string;
    upvoteCount: number;
    createdAt: Date;
    relevanceScore: number;
  }>;
  suggestedFollowups: string[];     // 2-3 suggested follow-up questions
  metadata: {
    totalSources: number;
    modelUsed: string;              // e.g., "gpt-5-nano"
    queryProcessedAt: Date;
  };
}
```

**Important Note About Answer Format:**

The `answer` field contains **HTML with clickable links** to posts and replies. Format:

- Posts: `<a href="/posts/{id}" class="post-link" data-post-id="{id}">{Title}</a>`
- Replies: `<a href="/posts/{post_id}#reply-{id}" class="reply-link" data-reply-id="{id}">this reply</a>`

**Frontend Usage:**

```tsx
// Safely render HTML in React
<div dangerouslySetInnerHTML={{ __html: response.answer }} />;

// Or sanitize first (recommended)
import DOMPurify from 'dompurify';
<div
  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(response.answer) }}
/>;
```

## Example Usage

### Basic Query

```bash
curl -X POST http://localhost:3000/search/ai \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "query": "How do I set up authentication in NestJS?"
  }'
```

**Response:**

```json
{
  "answer": "You can set up authentication in NestJS using Passport and JWT. Check out <a href=\"/posts/45\" class=\"post-link\" data-post-id=\"45\">NestJS Authentication Setup Guide</a> which provides a complete guide with code examples for implementing JWT authentication with passport-jwt strategy.",
  "sources": [
    {
      "id": "post_45",
      "type": "post",
      "postId": 45,
      "threadId": 12,
      "threadName": "Backend Development",
      "buId": 3,
      "buName": "Engineering",
      "title": "NestJS Authentication Setup Guide",
      "snippet": "Here's a complete guide to setting up JWT authentication in NestJS. First, install the required packages: npm install @nestjs/passport passport...",
      "url": "/posts/45",
      "authorName": "John Doe",
      "upvoteCount": 24,
      "createdAt": "2025-11-15T10:30:00Z",
      "relevanceScore": 1.0
    }
  ],
      "postId": 45,
      "threadId": 12,
      "threadName": "Backend Development",
      "buId": 3,
      "buName": "Engineering",
      "title": "NestJS Authentication Setup Guide",
      "snippet": "Here's a complete guide to setting up JWT authentication in NestJS. First, install the required packages: npm install @nestjs/passport passport...",
      "url": "/posts/45",
      "authorName": "John Doe",
      "upvoteCount": 24,
      "createdAt": "2025-11-15T10:30:00Z",
      "relevanceScore": 1.0
    }
  ],
  "suggestedFollowups": [
    "How do I add role-based access control?",
    "What are the best practices for JWT token management?",
    "Can you show me how to implement refresh tokens?"
  ],
  "metadata": {
    "totalSources": 1,
    "modelUsed": "gpt-5-nano",
    "queryProcessedAt": "2025-11-19T14:25:30Z"
  }
}
```

### Multi-turn Conversation

```bash
curl -X POST http://localhost:3000/search/ai \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "query": "What about TypeORM setup?",
    "conversationHistory": [
      {
        "role": "user",
        "content": "How do I set up authentication in NestJS?"
      },
      {
        "role": "assistant",
        "content": "Based on the available posts, you can set up authentication..."
      }
    ]
  }'
```

### Filtered by Thread

```bash
curl -X POST http://localhost:3000/search/ai \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "query": "Recent updates on React hooks",
    "threadId": "8"
  }'
```

## Security & Permissions

- **Authentication Required:** Users must be logged in (JWT token)
- **Thread Access Control:** Users only see results from threads they have access to via `thread_users` table
- **BU Filtering:** Optional filtering by Business Unit
- **Rate Limiting:** Configurable in `search.config.ts`:
  - Default: 20 requests/hour, 100 requests/day per user

## Configuration

Adjust AI search behavior in `src/search/search.config.ts`:

```typescript
ai: {
  maxContextDocuments: 20,          // Max docs sent to OpenAI
  responseMaxLength: 500,           // Max AI answer length
  includeSnippetLength: 150,        // Snippet excerpt length
  suggestedFollowupsCount: 3,       // Number of follow-up suggestions
  rateLimit: {
    requestsPerHour: 20,
    requestsPerDay: 100,
  },
}
```

## How It Works

1. **Pre-filtering:** Uses existing keyword search to find top 20 relevant documents
2. **Permission Check:** Filters results by user's accessible threads
3. **Context Building:** Loads full post/reply details with authors, threads, BUs
4. **OpenAI Call:** Sends context + query to GPT-4 with function calling
5. **Response Formatting:** Maps AI-selected document IDs to full source objects with URLs
6. **Result Return:** Returns conversational answer + formatted sources + follow-ups

## Cost Optimization

The system optimizes OpenAI API costs by:

1. **Pre-filtering with keyword search** before calling OpenAI
2. **Limiting context to top 20 documents** (configurable)
3. **Using function calling** for structured responses
4. **Caching user thread permissions** in memory

## Error Handling

Common errors and solutions:

| Error                                   | Cause                    | Solution                             |
| --------------------------------------- | ------------------------ | ------------------------------------ |
| "OpenAI API key not configured"         | Missing `OPENAI_API_KEY` | Add key to `.env` file               |
| "I couldn't find any relevant posts..." | No accessible results    | Check thread permissions             |
| 401 Unauthorized                        | Missing/invalid JWT      | Include valid `Authorization` header |
| 429 Rate Limit                          | Too many requests        | Wait before retrying                 |

## Testing

### 1. Check Service Status

```bash
curl http://localhost:3000/stats
```

### 2. Test AI Search (requires valid JWT)

```bash
# First, login to get JWT token
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'

# Use the returned token for AI search
export JWT_TOKEN="eyJhbGc..."

curl -X POST http://localhost:3000/search/ai \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{"query": "test query"}'
```

## Frontend Integration Example

### React/TypeScript Component

```typescript
import { useState } from 'react';
import DOMPurify from 'dompurify';

interface AiSearchResponse {
  answer: string;
  sources: Array<{
    id: string;
    type: 'post' | 'reply';
    postId: number;
    title?: string;
    snippet: string;
    url: string;
    authorName: string;
    upvoteCount: number;
    threadName: string | null;
  }>;
  suggestedFollowups: string[];
  metadata: {
    totalSources: number;
    modelUsed: string;
  };
}

function AiSearchComponent() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<AiSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await fetch('/search/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();
      setResponse(data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-search">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Ask anything..."
      />
      <button onClick={handleSearch} disabled={loading}>
        {loading ? 'Searching...' : 'Search'}
      </button>

      {response && (
        <div className="results">
          {/* Render HTML answer with clickable links */}
          <div
            className="answer"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(response.answer, {
                ALLOWED_TAGS: ['a'],
                ALLOWED_ATTR: ['href', 'class', 'data-post-id', 'data-reply-id']
              })
            }}
          />

          {/* Display sources as cards */}
          <div className="sources">
            <h3>Sources ({response.sources.length})</h3>
            {response.sources.map((source) => (
              <div key={source.id} className="source-card">
                <a href={source.url}>
                  <h4>{source.title || `Reply in post #${source.postId}`}</h4>
                  <p className="snippet">{source.snippet}</p>
                  <div className="meta">
                    <span>by {source.authorName}</span>
                    <span>👍 {source.upvoteCount}</span>
                    {source.threadName && <span>in {source.threadName}</span>}
                  </div>
                </a>
              </div>
            ))}
          </div>

          {/* Suggested follow-ups */}
          <div className="followups">
            <h3>You might also want to ask:</h3>
            {response.suggestedFollowups.map((followup, idx) => (
              <button
                key={idx}
                onClick={() => setQuery(followup)}
                className="followup-btn"
              >
                {followup}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AiSearchComponent;
```

### Styling for Links (CSS)

```css
/* Style the AI-generated links */
.answer a.post-link {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
  border-bottom: 1px solid #3b82f6;
}

.answer a.post-link:hover {
  color: #2563eb;
  border-bottom-color: #2563eb;
}

.answer a.reply-link {
  color: #8b5cf6;
  text-decoration: none;
  font-style: italic;
}

.answer a.reply-link:hover {
  color: #7c3aed;
  text-decoration: underline;
}
  };
}
```

## Troubleshooting

### No results returned

1. Check if user has access to any threads
2. Verify posts/replies exist in database
3. Check if query matches indexed content

### OpenAI errors

1. Verify API key is valid
2. Check OpenAI account has credits
3. Review rate limits on OpenAI dashboard

### Performance issues

1. Reduce `maxContextDocuments` in config
2. Implement caching for common queries
3. Consider using embeddings for large datasets

## Next Steps

Consider these enhancements:

1. **Caching:** Add Redis caching for frequent queries
2. **Analytics:** Track popular queries and response quality
3. **Embeddings:** Use `text-embedding-3-small` for semantic search
4. **Streaming:** Implement SSE for real-time response streaming
5. **Feedback:** Add thumbs up/down for answer quality
