# GearGuard - Maintenance Management System

## Setup Instructions

### 1. Start PostgreSQL with Docker

```bash
docker-compose up -d
```

### 2. Generate Prisma Client

```bash
npm run prisma:generate
```

### 3. Run Database Migration

```bash
npm run prisma:migrate
```

### 4. Start Development Server

```bash
npm run dev
```

The server will run on `http://localhost:3000`

## API Endpoints

### Authentication Routes

#### 1. Register User
```
POST /api/auth/register
```
**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "EMPLOYEE"
}
```
**Roles:** `EMPLOYEE`, `TECHNICIAN`, `MANAGER`

#### 2. Login
```
POST /api/auth/login
```
**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
**Response:**
```json
{
  "message": "Login successful",
  "accessToken": "jwt-token",
  "refreshToken": "refresh-token",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "EMPLOYEE"
  }
}
```

#### 3. Refresh Token
```
POST /api/auth/refresh
```
**Body:**
```json
{
  "refreshToken": "your-refresh-token"
}
```

#### 4. Logout
```
POST /api/auth/logout
```
**Body:**
```json
{
  "refreshToken": "your-refresh-token"
}
```

#### 5. Get Current User
```
GET /api/auth/me
```
**Headers:**
```
Authorization: Bearer <access-token>
```

## Role-Based Access

- **EMPLOYEE**: Can create maintenance requests, view own requests
- **TECHNICIAN**: Can view assigned requests, update status, add work logs
- **MANAGER**: Full access - create teams, equipment, assign tasks, view analytics

## Environment Variables

Check `.env` file for configuration:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret for access tokens
- `JWT_REFRESH_SECRET`: Secret for refresh tokens
- `PORT`: Server port (default: 3000)

## Docker Commands

Start database:
```bash
docker-compose up -d
```

Stop database:
```bash
docker-compose down
```

View logs:
```bash
docker-compose logs -f
```

## Development

Build TypeScript:
```bash
npm run build
```

Start production server:
```bash
npm start
```

Open Prisma Studio:
```bash
npm run prisma:studio
```
