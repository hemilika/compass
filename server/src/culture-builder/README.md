# AI Culture Builder Module

## Overview

The AI Culture Builder module automatically generates weekly, lightweight culture-building posts using LangGraph and OpenAI. It creates:

- **Weekly Appreciation Threads** - Recognizes top contributors and highlights wins
- **Community Challenges** - Micro-challenges to boost engagement
- **Cross-BU Connection Suggestions** - Connects people across business units based on shared interests

All AI-generated content is clearly labeled with 🤖 emoji and is data-driven based on real user behavior (upvotes, replies, activity).

## Features

### 1. Weekly Appreciation Threads (Every Monday 9 AM)

- Analyzes past 7 days of activity
- Identifies top contributors by posts, replies, and upvotes
- Highlights the most popular post of the week
- Generates personalized, warm recognition content using AI

### 2. Weekly Challenges (Every Wednesday 10 AM)

- Rotates between 4 challenge types:
  - **Engagement Challenge** - Encourage replies outside usual topics
  - **Cross-BU Collaboration** - Connect with other business units
  - **Mentorship Moments** - Share lessons and mentor others
  - **Knowledge Sharing** - Document expertise in posts
- AI generates engaging challenge descriptions

### 3. Connection Suggestions (Every Friday 2 PM)

- Analyzes user profiles (techstack, hobbies, roles)
- Finds cross-BU connections with shared interests
- Calculates match scores based on common interests
- AI generates personalized connection reasons
- Creates summary posts highlighting potential connections

## Installation

### 1. Install Dependencies

```bash
cd server
npm install @nestjs/schedule @langchain/langgraph @langchain/core @langchain/openai date-fns
```

### 2. Database Migrations

Create and run migrations for the new tables:

```sql
-- appreciation_threads table
CREATE TABLE appreciation_threads (
  id BIGSERIAL PRIMARY KEY,
  generated_post_id BIGINT NOT NULL,
  week_start_date DATE NOT NULL,
  contributors_data JSONB NOT NULL,
  generation_status VARCHAR NOT NULL DEFAULT 'generated',
  is_ai_generated BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (generated_post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- challenges table
CREATE TABLE challenges (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR NOT NULL,
  description TEXT NOT NULL,
  challenge_type VARCHAR NOT NULL,
  thread_id BIGINT,
  post_id BIGINT,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'active',
  participation_metrics JSONB,
  is_ai_generated BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE SET NULL
);

-- suggested_connections table
CREATE TABLE suggested_connections (
  id BIGSERIAL PRIMARY KEY,
  user1_id BIGINT NOT NULL,
  user2_id BIGINT NOT NULL,
  connection_reason TEXT NOT NULL,
  common_interests VARCHAR[] NOT NULL DEFAULT '{}',
  match_score FLOAT NOT NULL DEFAULT 0,
  status VARCHAR NOT NULL DEFAULT 'suggested',
  notification_post_id BIGINT,
  is_ai_generated BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_appreciation_threads_week ON appreciation_threads(week_start_date);
CREATE INDEX idx_challenges_status ON challenges(status);
CREATE INDEX idx_challenges_dates ON challenges(start_date, end_date);
CREATE INDEX idx_suggested_connections_users ON suggested_connections(user1_id, user2_id);
CREATE INDEX idx_suggested_connections_status ON suggested_connections(status);
```

### 3. Environment Variables

No additional environment variables needed beyond existing `OPENAI_API_KEY` and `OPENAI_MODEL`.

### 4. Restart Server

```bash
npm run start:dev
```

## Cron Schedule

The module automatically runs on the following schedule:

| Task                   | Schedule           | Cron Expression | Description                   |
| ---------------------- | ------------------ | --------------- | ----------------------------- |
| Weekly Appreciation    | Monday 9:00 AM     | `0 9 * * 1`     | Recognizes top contributors   |
| Weekly Challenge       | Wednesday 10:00 AM | `0 10 * * 3`    | Posts new community challenge |
| Connection Suggestions | Friday 2:00 PM     | `0 14 * * 5`    | Suggests cross-BU connections |

**Timezone:** America/New_York (configurable in `culture-scheduler.service.ts`)

## API Endpoints

All endpoints require authentication and admin role.

### Manual Generation (Admin Only)

```bash
# Generate appreciation thread manually
POST /culture-builder/generate/appreciation
Authorization: Bearer {jwt_token}
{
  "days": 7,
  "autoPost": true
}

# Generate challenge
POST /culture-builder/generate/challenge
Authorization: Bearer {jwt_token}
{
  "type": "engagement" // or "cross-bu", "mentorship", "knowledge-share"
}

# Generate connection suggestions
POST /culture-builder/generate/connections
Authorization: Bearer {jwt_token}
```

### Manual Scheduler Triggers (Admin Only)

```bash
# Trigger weekly appreciation
POST /culture-builder/trigger/weekly-appreciation

# Trigger weekly challenge
POST /culture-builder/trigger/weekly-challenge

# Trigger connection suggestions
POST /culture-builder/trigger/connection-suggestions
```

### Analytics Endpoints

```bash
# Get weekly analytics
GET /culture-builder/analytics/weekly

# Get top contributors
GET /culture-builder/analytics/top-contributors

# Get potential cross-BU connections
GET /culture-builder/analytics/connections
```

### Health Check

```bash
GET /culture-builder/health
```

## Testing

### 1. Test Analytics

```bash
curl -X GET http://localhost:3000/culture-builder/analytics/weekly \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2. Manual Generation Test

```bash
# Login as admin first
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@compass.com", "password": "password123"}'

# Use returned token
export TOKEN="eyJhbGc..."

# Generate appreciation thread
curl -X POST http://localhost:3000/culture-builder/generate/appreciation \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"days": 7}'
```

### 3. Check Generated Content

Look for posts with:

- 🤖 emoji in title (indicates AI-generated)
- Author: admin@compass.com (system user)
- Threads: "🌟 Weekly Appreciation", "🎯 Community Challenges", "🤝 Connect & Collaborate"

## Architecture

### Services

- **CultureBuilderService** - Main orchestration service
- **CultureAnalyticsService** - Data analysis and metrics
- **CultureAiService** - AI content generation with LangGraph
- **CultureSchedulerService** - Cron job management

### Entities

- **AppreciationThread** - Tracks generated appreciation posts
- **Challenge** - Stores active/completed challenges
- **SuggestedConnection** - Records connection suggestions

### Data Flow

```
┌─────────────────────┐
│  Cron Scheduler     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Analytics Service  │──► Query database for metrics
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   AI Service        │──► Generate content with LangGraph
│   (LangGraph)       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Create Post        │──► Save to database
│  Track Entity       │
└─────────────────────┘
```

## LangGraph Workflow

The AI service uses LangGraph for structured content generation:

```typescript
// Appreciation workflow
analyze_contributors → generate_appreciation_post → END

// States:
// - contributors: WeeklyContributor[]
// - generatedContent: string
// - error: string
```

## Configuration

### Modify Cron Schedule

Edit `culture-scheduler.service.ts`:

```typescript
@Cron('0 9 * * 1', {  // Change time/day here
    name: 'weekly-appreciation',
    timeZone: 'America/New_York',  // Change timezone
})
```

### Customize Challenge Types

Edit `culture-builder.service.ts`:

```typescript
private createChallengeData(type: ChallengeData['type'], analytics: any): ChallengeData {
  // Add or modify challenge types here
}
```

### Adjust Analytics Period

Change the `days` parameter in analytics calls:

```typescript
const contributors = await this.analyticsService.getTopContributors(14); // 14 days
```

## Safety & Opt-In

- All AI-generated posts are clearly labeled with 🤖 emoji
- Posts are created by a system user (admin@compass.com)
- Dedicated threads for culture content (users can unsubscribe)
- Content validation before posting
- Fallback to template-based content if AI fails
- Admin can manually review/approve before posting

## Troubleshooting

### Scheduler Not Running

Check if `@nestjs/schedule` is imported in `app.module.ts`:

```typescript
import { ScheduleModule } from '@nestjs/schedule';
// In imports array:
ScheduleModule.forRoot(),
```

### No Content Generated

- Check OpenAI API key is configured
- Verify there's activity in the database (posts, replies)
- Check logs for errors: `npm run start:dev`

### Permissions Issues

- Ensure admin user exists with email `admin@compass.com`
- Verify JWT token has admin role
- Check database permissions for new tables

## Future Enhancements

- [ ] User preference to opt-out of culture content
- [ ] A/B testing different content styles
- [ ] Sentiment analysis on posts
- [ ] Gamification (badges, streaks)
- [ ] Weekly digest emails
- [ ] Connection acceptance tracking
- [ ] Challenge participation metrics
- [ ] AI model fine-tuning on engagement data

## License

Internal use only - Part of Compass platform
