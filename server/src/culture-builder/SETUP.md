# AI Culture Builder - Quick Setup Guide

## 🚀 Quick Start (5 Minutes)

### Step 1: Install Dependencies

```bash
cd server
npm install
```

This will install the newly added packages:

- `@nestjs/schedule` - Cron job scheduling
- `@langchain/langgraph` - AI agent workflow
- `@langchain/core` - LangGraph core
- `@langchain/openai` - OpenAI integration for LangGraph
- `date-fns` - Date utilities

### Step 2: Run Database Migration

```bash
# Connect to your PostgreSQL database
psql -U your_user -d compass

# Run the migration
\i src/culture-builder/migration.sql

# Or copy-paste the SQL from migration.sql
```

This creates 3 new tables:

- `appreciation_threads`
- `challenges`
- `suggested_connections`

### Step 3: Verify Setup

```bash
# Start the server
npm run start:dev

# Server should start without errors
# Look for: "Nest application successfully started"
```

### Step 4: Test the Module

#### Test 1: Check Health

```bash
curl http://localhost:3000/culture-builder/health
```

Expected response:

```json
{
  "status": "ok",
  "service": "culture-builder",
  "timestamp": "2025-11-19T..."
}
```

#### Test 2: View Analytics (requires login)

```bash
# Login as admin
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@compass.com", "password": "password123"}'

# Save the token
export TOKEN="<access_token_from_response>"

# Get weekly analytics
curl http://localhost:3000/culture-builder/analytics/weekly \
  -H "Authorization: Bearer $TOKEN"
```

#### Test 3: Generate Appreciation Thread (Admin only)

```bash
curl -X POST http://localhost:3000/culture-builder/generate/appreciation \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"days": 7}'
```

Expected response:

```json
{
  "message": "Appreciation thread generated successfully",
  "postId": 123,
  "postTitle": "🤖 🌟 Weekly Recognition - Week of Nov 18, 2025"
}
```

#### Test 4: Check Generated Post

Go to your posts table or use the API:

```bash
curl http://localhost:3000/posts/123 \
  -H "Authorization: Bearer $TOKEN"
```

You should see:

- Title starting with 🤖 🌟
- AI-generated content recognizing contributors
- Created by admin user (system user)

## 📅 Automatic Schedule

Once running, the module will automatically:

| Day       | Time     | Action                              |
| --------- | -------- | ----------------------------------- |
| Monday    | 9:00 AM  | Generate weekly appreciation thread |
| Wednesday | 10:00 AM | Generate community challenge        |
| Friday    | 2:00 PM  | Generate connection suggestions     |

**Timezone:** America/New_York (configurable in `culture-scheduler.service.ts`)

## 🎯 Using Postman

1. Import `Compass-API.postman_collection.json` into Postman
2. Login to get JWT token (stored in collection variable `access_token`)
3. Navigate to "Culture Builder" folder
4. Try any endpoint (all require authentication)

### Recommended Test Flow:

1. **Get Weekly Analytics** - See current data
2. **Get Top Contributors** - View contributor details
3. **Generate Appreciation** - Create test post
4. **View generated post** in Posts → Get Post by ID

## 🔧 Customization

### Change Cron Schedule

Edit `src/culture-builder/culture-scheduler.service.ts`:

```typescript
@Cron('0 9 * * 1', {  // Hour Minute * * DayOfWeek
    name: 'weekly-appreciation',
    timeZone: 'America/New_York',  // Your timezone
})
```

### Modify Challenge Types

Edit `src/culture-builder/culture-builder.service.ts`:

```typescript
private createChallengeData(type: ChallengeData['type'], analytics: any): ChallengeData {
  const challenges = {
    'engagement': {
      title: 'Your Custom Title',
      description: 'Your custom description',
    },
    // Add more types...
  };
  return { type, ...challenges[type] };
}
```

### Adjust Analytics Period

Change the days parameter:

```typescript
// In culture-builder.service.ts
const contributors = await this.analyticsService.getTopContributors(14); // 14 days instead of 7
```

## 🐛 Troubleshooting

### Issue: "Cannot find module '@nestjs/schedule'"

**Solution:**

```bash
npm install @nestjs/schedule @langchain/langgraph @langchain/core @langchain/openai date-fns
```

### Issue: Cron jobs not running

**Check:**

1. Verify `ScheduleModule.forRoot()` is in `culture-builder.module.ts` ✅ (it is)
2. Check server logs for cron execution messages
3. Wait for scheduled time or use manual triggers

**Manual trigger for testing:**

```bash
curl -X POST http://localhost:3000/culture-builder/trigger/weekly-appreciation \
  -H "Authorization: Bearer $TOKEN"
```

### Issue: "No system user or admin user found"

**Solution:** Ensure admin user exists:

```bash
# Run seed again
npm run seed

# Or create manually via signup
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@compass.com",
    "password": "password123",
    "firstname": "Admin",
    "lastname": "User"
  }'
```

### Issue: No contributors found

**Solution:** Generate some test data:

```bash
# Create test posts and replies using seed data
npm run seed

# Or manually create via Postman using Posts → Create Post
```

### Issue: Database tables not found

**Solution:** Run the migration:

```bash
psql -U your_user -d compass -f src/culture-builder/migration.sql
```

## 📊 Monitoring

### View Logs

```bash
# Development
npm run start:dev

# Look for:
# [CultureSchedulerService] 🌟 Starting weekly appreciation thread generation...
# [CultureBuilderService] Created appreciation thread post ID: 123
```

### Check Database

```sql
-- Recent appreciation threads
SELECT * FROM appreciation_threads ORDER BY created_at DESC LIMIT 5;

-- Active challenges
SELECT * FROM challenges WHERE status = 'active';

-- Connection suggestions
SELECT * FROM suggested_connections ORDER BY match_score DESC LIMIT 10;
```

### Check Generated Posts

```sql
-- AI-generated posts (look for 🤖 in title)
SELECT id, title, created_at, author_id
FROM posts
WHERE title LIKE '🤖%'
ORDER BY created_at DESC;
```

## ✅ Verification Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] Database tables created (run `migration.sql`)
- [ ] Server starts without errors
- [ ] Health endpoint responds: `/culture-builder/health`
- [ ] Can view analytics (with JWT token)
- [ ] Can manually generate appreciation thread (admin)
- [ ] Generated post appears in database
- [ ] Cron schedule configured (check logs on scheduled time)

## 🎉 Success Indicators

You'll know it's working when:

1. **Server starts cleanly** - No import errors
2. **Endpoints respond** - Health check returns OK
3. **Analytics work** - GET `/analytics/weekly` returns data
4. **Manual generation works** - Can create appreciation threads
5. **Posts appear** - Generated posts show up with 🤖 emoji
6. **Cron logs appear** - See scheduler messages in logs at scheduled times

## 📚 Next Steps

1. **Test all 3 generation types:**
   - Appreciation threads
   - Challenges
   - Connection suggestions

2. **Customize content:**
   - Edit AI prompts in `culture-ai.service.ts`
   - Adjust challenge types in `culture-builder.service.ts`

3. **Monitor for a week:**
   - Check Monday 9 AM for appreciation
   - Check Wednesday 10 AM for challenge
   - Check Friday 2 PM for connections

4. **Collect feedback:**
   - Ask users about AI-generated content
   - Adjust tone/style based on feedback

## 🆘 Need Help?

Check the detailed README: `src/culture-builder/README.md`

Common commands:

```bash
# View logs
npm run start:dev

# Run seed data
npm run seed

# Check database
psql -U your_user -d compass

# Test endpoints
curl http://localhost:3000/culture-builder/health
```

---

**Module Status:** ✅ Fully Implemented  
**Auto-Generated Content:** 🤖 AI-Powered  
**Schedule:** 📅 Weekly (Mon/Wed/Fri)  
**Data-Driven:** 📊 Based on real activity
