# Team AAA - GearGuard Maintenance Management System# GearGuard - Maintenance Management System



## Project Structure## Setup Instructions



```### 1. Start PostgreSQL with Docker

Team_AAA/

├── backend/              # Backend API (Node.js + TypeScript + Prisma)```bash

│   ├── src/docker-compose up -d

│   │   ├── modules/      # Feature modules```

│   │   ├── shared/       # Shared utilities

│   │   ├── config/       # Configuration### 2. Generate Prisma Client

│   │   └── server.ts     # Express app

│   ├── prisma/           # Database schema & migrations```bash

│   ├── package.jsonnpm run prisma:generate

│   ├── tsconfig.json```

│   └── docker-compose.yml

└── README.md             # This file### 3. Run Database Migration



``````bash

npm run prisma:migrate

## Quick Start```



### Backend Setup### 4. Start Development Server



```bash```bash

cd backendnpm run dev

```

# Install dependencies

npm installThe server will run on `http://localhost:3000`



# Start PostgreSQL with Docker## API Endpoints

docker-compose up -d

### Authentication Routes

# Run database migrations

npm run prisma:migrate#### 1. Register User

```

# Start development serverPOST /api/auth/register

npm run dev```

```**Body:**

```json

The API will be available at `http://localhost:3000`{

  "name": "John Doe",

## Features  "email": "john@example.com",

  "password": "password123",

✅ Role-based authentication (Employee, Technician, Manager)  "role": "EMPLOYEE"

✅ JWT-based access & refresh tokens}

✅ Modular architecture```

✅ TypeScript support**Roles:** `EMPLOYEE`, `TECHNICIAN`, `MANAGER`

✅ PostgreSQL database with Prisma ORM

✅ Docker containerization#### 2. Login

```

## DocumentationPOST /api/auth/login

```

- [Backend README](./backend/README.md) - API endpoints and setup**Body:**

- [Architecture Guide](./backend/ARCHITECTURE.md) - Code structure and patterns```json

- [Project Structure](./backend/PROJECT_STRUCTURE.md) - Detailed file organization{

  "email": "john@example.com",

## Tech Stack  "password": "password123"

}

### Backend```

- **Runtime**: Node.js**Response:**

- **Language**: TypeScript```json

- **Framework**: Express.js{

- **Database**: PostgreSQL  "message": "Login successful",

- **ORM**: Prisma  "accessToken": "jwt-token",

- **Authentication**: JWT (jsonwebtoken)  "refreshToken": "refresh-token",

- **Validation**: Zod  "user": {

- **Password Hashing**: bcrypt    "id": "uuid",

    "name": "John Doe",

## Team Information    "email": "john@example.com",

    "role": "EMPLOYEE"

**Team Name**: Team AAA    }

**Project**: GearGuard - AI-Powered Maintenance Management System}

```

## License

#### 3. Refresh Token

MIT```

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
