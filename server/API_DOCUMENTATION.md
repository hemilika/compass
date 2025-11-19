# Compass API - Authentication & Authorization Implementation

## Overview

This NestJS application implements a complete JWT-based authentication and authorization system with role-based access control (RBAC) for a forum-like platform with threads, posts, and replies.

## Setup Instructions

### 1. Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=compass
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRATION=7d
PORT=3000
NODE_ENV=development
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

Ensure PostgreSQL is running and create the database:

```sql
CREATE DATABASE compass;
```

### 4. Seed the Database (Optional)

Populate the database with sample data:

```bash
npm run seed
```

This will create:

- 6 sample users (including 1 admin)
  - Admin: `admin@compass.com` / `password123`
  - Users: `john.doe@compass.com`, `jane.smith@compass.com`, etc. / `password123`
- 6 business units
- 6 discussion threads
- 10 posts with content
- 12 replies
- Multiple upvotes

### 5. Run the Application

```bash
npm run start:dev
```

The server will start on `http://localhost:3000`

## Authentication System

### JWT Structure

The JWT token contains:

- `userId`: User's unique identifier
- `email`: User's email address
- `roles`: Array of roles (e.g., ['admin'], ['user'])

### Roles

- **admin**: Full access to delete any content and manage users
- **user**: Can manage their own content

## API Endpoints

### Authentication

#### POST /auth/signup

Register a new user

```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstname": "John",
  "lastname": "Doe",
  "techstack": ["React", "Node.js"],
  "user_roles": ["DEV"],
  "hobbies": ["coding"]
}
```

#### POST /auth/login

Login and receive JWT token

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:

```json
{
  "accessToken": "jwt-token-here",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstname": "John",
    "lastname": "Doe",
    "roles": ["user"]
  }
}
```

### Users

All user endpoints require authentication (JWT Bearer token).

#### GET /users

Get all users (authenticated)

#### GET /users/:id

Get user by ID (authenticated)

#### GET /users/me/profile

Get current user's profile (authenticated)

#### PATCH /users/:id

Update user profile (owner or admin only)

```json
{
  "firstname": "John",
  "lastname": "Smith",
  "techstack": ["Vue", "Python"],
  "user_roles": ["PO"],
  "hobbies": ["gaming"]
}
```

#### PATCH /users/:id/deactivate

Deactivate a user (admin only)

#### PATCH /users/:id/activate

Activate a user (admin only)

#### DELETE /users/:id

Delete a user (admin only)

### Business Units (BU)

#### POST /bu

Create a business unit (admin only)

```json
{
  "name": "Engineering"
}
```

#### GET /bu

Get all business units (authenticated)

#### GET /bu/:id

Get business unit by ID (authenticated)

#### PATCH /bu/:id

Update business unit (admin only)

```json
{
  "name": "Engineering Department"
}
```

#### DELETE /bu/:id

Delete business unit (admin only)

### Threads

#### POST /threads

Create a new thread (authenticated)

```json
{
  "name": "Technical Discussion",
  "description": "Discuss technical topics",
  "bu_id": 1
}
```

#### GET /threads

Get all threads (authenticated)

#### GET /threads/:id

Get thread by ID with members (authenticated)

#### PATCH /threads/:id

Update thread (admin or thread moderator only)

```json
{
  "name": "Updated Thread Name",
  "description": "Updated description"
}
```

#### DELETE /threads/:id

Delete thread (admin only)

#### POST /threads/:id/users/:userId

Add user to thread (admin or thread moderator only)

```json
{
  "role": "member" // or "moderator"
}
```

#### DELETE /threads/:id/users/:userId

Remove user from thread (admin or thread moderator only)

### Posts

#### POST /posts

Create a new post (authenticated)

```json
{
  "thread_id": 1,
  "bu_id": 1,
  "title": "My First Post",
  "content": "This is the content of my post",
  "icon_url": "https://example.com/icon.png",
  "image_urls": ["https://example.com/image1.png"]
}
```

#### GET /posts

Get all posts (authenticated)

#### GET /posts?threadId=1

Get posts by thread ID (authenticated)

#### GET /posts/:id

Get post by ID with replies (authenticated)

#### PATCH /posts/:id

Update post (owner or admin only)

```json
{
  "title": "Updated Title",
  "content": "Updated content",
  "image_urls": ["https://example.com/new-image.png"]
}
```

#### DELETE /posts/:id

Delete post (owner or admin only)

### Replies

#### POST /replies

Create a new reply (authenticated)

```json
{
  "post_id": 1,
  "parent_reply_id": null,
  "content": "This is my reply",
  "image_urls": ["https://example.com/reply-image.png"]
}
```

#### GET /replies?postId=1

Get replies by post ID (authenticated)

#### GET /replies/:id

Get reply by ID (authenticated)

#### PATCH /replies/:id

Update reply (owner or admin only)

```json
{
  "content": "Updated reply content",
  "image_urls": []
}
```

#### DELETE /replies/:id

Delete reply (owner or admin only)

### Upvotes

#### POST /upvotes/posts/:postId

Upvote a post (authenticated)

#### DELETE /upvotes/posts/:postId

Remove upvote from post (authenticated)

#### POST /upvotes/replies/:replyId

Upvote a reply (authenticated)

#### DELETE /upvotes/replies/:replyId

Remove upvote from reply (authenticated)

#### GET /upvotes/me

Get current user's upvotes (authenticated)

## Authorization Rules

### Admin Permissions

- Delete any thread, post, or reply
- Deactivate/activate users
- Manage business units
- Full CRUD on all resources

### User Permissions

- Signup and manage own profile
- Create threads (becomes a member automatically)
- CRUD on own threads, posts, and replies
- Upvote posts and replies
- View all public content

### Thread Moderators

- Can update thread details
- Can add/remove users from thread
- Cannot delete threads (admin only)

## Security Features

1. **Password Hashing**: Passwords are hashed using bcrypt (10 salt rounds)
2. **JWT Authentication**: Secure token-based authentication
3. **Role-Based Access Control**: Guards protect routes based on user roles
4. **Ownership Validation**: Users can only modify their own content
5. **Input Validation**: DTOs with class-validator ensure data integrity
6. **CORS Configuration**: Configured for frontend integration
7. **User Deactivation**: Soft deactivation via `is_active` flag

## Request Headers

All authenticated requests must include:

```
Authorization: Bearer <jwt-token>
```

## Database Schema

The application uses PostgreSQL with the following main entities:

- **Users**: User accounts with roles and profile information
- **BU**: Business Units for organization
- **Threads**: Discussion threads linked to BUs
- **ThreadUsers**: Junction table for thread membership
- **Posts**: Main posts within threads
- **Replies**: Nested replies to posts (supports parent-child relationships)
- **Upvotes**: Track user upvotes on posts and replies

## Development

### Build

```bash
npm run build
```

### Run in Production

```bash
npm run start:prod
```

### Testing

```bash
npm run test
```

### Seed Database

```bash
npm run seed
```

## Sample Users (After Seeding)

| Email                      | Password    | Role  | Name           |
| -------------------------- | ----------- | ----- | -------------- |
| admin@compass.com          | password123 | admin | Admin User     |
| john.doe@compass.com       | password123 | user  | John Doe       |
| jane.smith@compass.com     | password123 | user  | Jane Smith     |
| bob.johnson@compass.com    | password123 | user  | Bob Johnson    |
| alice.williams@compass.com | password123 | user  | Alice Williams |
| charlie.brown@compass.com  | password123 | user  | Charlie Brown  |

## Notes

- TypeORM synchronize is enabled in development mode (auto-creates tables)
- Disable synchronize in production and use migrations
- JWT tokens expire after 7 days (configurable via JWT_EXPIRATION)
- Use `npm run seed` to populate the database with sample data
- All seed users have the password `password123`
