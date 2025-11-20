# Seed Data Documentation

This document describes the comprehensive seed data generated for the Compass application, covering a full week of realistic user activity.

## Overview

The seeder creates realistic data for all entities in the system, simulating a week of activity from a diverse team of 15 professionals.

## Running the Seeder

```bash
npm run seed
```

This will:

1. Clear all existing data from the database
2. Seed all entities in the correct order (respecting foreign key constraints)
3. Create timestamps spanning the past 7 days to simulate realistic activity

## Data Summary

### Users (15)

Diverse team of professionals with realistic profiles:

| Name            | Role                      | Tech Stack                           | Department       |
| --------------- | ------------------------- | ------------------------------------ | ---------------- |
| Sarah Johnson   | Engineering Manager       | NestJS, React, PostgreSQL            | Engineering      |
| Michael Chen    | Senior Frontend Developer | React, TypeScript, GraphQL           | Engineering      |
| Emily Rodriguez | Senior Backend Developer  | Python, Django, PostgreSQL           | Engineering      |
| David Patel     | Full Stack Developer      | Vue.js, Express, MongoDB             | Engineering      |
| Jessica Kim     | Mobile Developer          | React Native, Swift, Kotlin          | Engineering      |
| Alex Thompson   | DevOps Engineer           | AWS, Docker, Kubernetes              | Engineering      |
| Maria Garcia    | Product Designer          | Figma, Adobe XD, Prototyping         | Design           |
| James Wilson    | Product Manager           | Product Management, Analytics        | Product          |
| Olivia Brown    | Backend Developer         | Java, Spring Boot, Microservices     | Engineering      |
| Ryan Murphy     | Frontend Developer        | Angular, RxJS, SCSS                  | Engineering      |
| Sophia Martinez | Data Scientist            | Machine Learning, Python, TensorFlow | Data & Analytics |
| Daniel Lee      | Backend Engineer          | Go, gRPC, Microservices              | Engineering      |
| Amanda Taylor   | QA Engineer               | Selenium, Playwright, Jest           | Engineering      |
| Chris Anderson  | Security Engineer         | Penetration Testing, OWASP           | Engineering      |
| Rachel White    | Systems Developer         | Rust, WebAssembly, Performance       | Engineering      |

**Authentication:** All users have password `password123`

### Business Units (6)

- Engineering
- Product
- Design
- Data & Analytics
- Marketing
- Operations

### Threads (12)

Discussion channels organized by topic:

1. **Welcome & Introductions** - General, no BU
2. **Engineering Best Practices** - Engineering BU
3. **Frontend Frameworks** - Engineering BU
4. **Backend Architecture** - Engineering BU
5. **DevOps & Infrastructure** - Engineering BU
6. **Product Discovery** - Product BU
7. **Design Systems & UI/UX** - Design BU
8. **Data & Analytics** - Data & Analytics BU
9. **Security & Privacy** - Engineering BU
10. **Mobile Development** - Engineering BU
11. **Coffee & Code** - General, no BU
12. **Learning & Growth** - General, no BU

### Thread Memberships

- Moderators assigned based on expertise
- Engineering team members in engineering threads
- Everyone in Welcome & Coffee threads
- Cross-functional participation in relevant threads

### Posts (20+)

Posts span the full week with realistic timestamps:

#### Week Timeline:

- **7 days ago (Monday)**: Welcome posts, code review guidelines
- **6 days ago (Tuesday)**: React Server Components discussion, database pooling, Q4 roadmap
- **5 days ago (Wednesday)**: GitHub Actions migration, design system preview
- **4 days ago (Thursday)**: Microservices discussion, ML model results, React Native vs Flutter
- **3 days ago (Friday)**: Security audit findings, music recommendations, Angular Signals
- **2 days ago (Saturday)**: Learning resources, homelab projects
- **1 day ago (Sunday)**: Go vs Rust comparison, tech podcasts
- **Today**: Test automation pyramid discussion

#### Post Topics:

- Technical discussions (React, TypeScript, databases, microservices)
- Architecture decisions (Go vs Rust, React Native vs Flutter)
- Process improvements (code reviews, CI/CD, testing)
- Product features (dark mode, roadmap priorities)
- Security audits and best practices
- Team culture (music, learning, side projects)
- Design systems and UI/UX
- Data science and ML models

### Replies (50+)

Thoughtful responses and discussions on posts, including:

- Technical insights and experiences
- Questions and clarifications
- Agreement and alternative viewpoints
- Helpful resources and recommendations
- Nested conversations (parent-child relationships)

### Upvotes

Distributed across posts and replies to reflect engagement:

- Popular posts: 15-25 upvotes
- Good discussions: 8-12 upvotes
- Regular posts: 3-7 upvotes
- Helpful replies: 2-8 upvotes

### Culture Builder Entities

#### Culture Quizzes (3)

1. **Company Values & Culture - Week 1** (Active)
   - 5 questions about values, collaboration, and culture
   - Created 6 days ago
2. **Engineering Excellence - Week 2** (Active)
   - 5 questions about code review, testing, and technical practices
   - Created 3 days ago

3. **Team Collaboration - Week 3** (Inactive)
   - 3 questions about cross-team work and communication
   - Created 10 days ago

#### Quiz Submissions (20+)

- 12 users completed Quiz 1 (most passed)
- 8 users completed Quiz 2 (most passed)
- Realistic mix of perfect scores and learning attempts
- Timestamps distributed over past 5 days

#### Appreciation Threads (1)

Weekly appreciation post recognizing top contributors:

- Top contributors with highlights
- Team metrics (posts, replies, engagement)
- Generated content celebrating team achievements
- Links to actual posts in the system

#### Challenges (3)

1. **November Code Quality Challenge** (Active)
   - Month-long initiative
   - 45 participants
   - Focus on testing, documentation, and tech debt

2. **Weekly Knowledge Sharing** (Active)
   - Ongoing weekly challenge
   - 28 participants
   - 82% engagement rate

3. **October Hacktoberfest** (Completed)
   - Finished challenge
   - 18 participants
   - 42 open source contributions

## Data Characteristics

### Realism

- **Authentic Names**: Diverse, realistic names reflecting a global team
- **Realistic Content**: Actual technical discussions you'd find in a real company
- **Natural Timestamps**: Distributed throughout the week with higher activity on weekdays
- **Varied Engagement**: Not everyone participates in everything
- **Real Tech Stack**: Current, relevant technologies (2024)
- **Genuine Challenges**: Real engineering discussions and decisions

### Relationships

All foreign key relationships are properly maintained:

- Users belong to Business Units
- Threads optionally belong to Business Units
- Posts belong to Threads and Authors
- Replies belong to Posts and Authors
- Upvotes belong to Users and either Posts or Replies
- Quiz Submissions link Users and Quizzes
- Appreciation Threads reference Posts
- Challenges reference Threads

### Data Volume

- **15 Users** with complete profiles
- **6 Business Units**
- **12 Threads** covering diverse topics
- **100+ Thread Memberships**
- **20+ Posts** with rich content
- **50+ Replies** with thoughtful responses
- **50+ Upvotes** distributed realistically
- **3 Quizzes** with 15+ questions total
- **20+ Quiz Submissions**
- **1 Appreciation Thread** with metrics
- **3 Challenges** at different lifecycle stages

## Use Cases

This seed data supports testing and development of:

1. **Social Features**: Posts, replies, upvotes, threads
2. **Search**: Diverse content across topics and users
3. **Analytics**: Engagement metrics, user activity, trends
4. **Culture Building**: Quizzes, appreciations, challenges
5. **Permissions**: Role-based access (moderators, members)
6. **Business Logic**: Cross-BU collaboration, thread management
7. **Time-based Features**: Activity over time, weekly summaries
8. **User Profiles**: Diverse tech stacks, roles, interests
9. **Gamification**: Challenge participation, quiz scores
10. **Notifications**: Varied activity types to trigger notifications

## Extending the Data

To add more seed data:

1. **Add Users**: Update `seedUsers()` method
2. **Add Posts**: Add to `seedPosts()` with appropriate timestamps
3. **Add Replies**: Add to `seedReplies()` linking to existing posts
4. **Add Quizzes**: Add to `seedQuizzes()` with new questions
5. **Add Challenges**: Add to `seedChallenges()` with metrics

Remember to:

- Maintain referential integrity
- Use realistic timestamps
- Keep content authentic and relevant
- Balance participation across users

## Notes

- All passwords are hashed with bcrypt
- Timestamps use real Date objects for accurate sorting
- IDs are auto-generated by PostgreSQL
- The seeder is idempotent (clears before seeding)
- Data is suitable for both development and demo purposes

## Support

For issues or questions about the seed data:

1. Check entity relationships in the respective entity files
2. Review the seeder service for data structure
3. Ensure all required repositories are injected
4. Verify database connection before running seeder
