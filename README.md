# AN-NADJAH — School Management Platform

A modern, real-time school management platform connecting teachers, students, and parents. Built with Next.js 15, TypeScript, and Neon PostgreSQL.

## Features

### For Teachers
- **Dashboard** — Overview of classes, students, grades, and attendance
- **Grade Management** — Record and manage scores (out of 20) with performance analytics
- **Attendance Tracking** — Mark present/absent/late with time, subject, and notes
- **Resource Sharing** — Upload and share PDFs, YouTube links, and web resources with specific classes
- **Shared Notes** — Create academic notes, behavior reports, and recommendations grouped by subject
- **Announcements** — Post announcements to classes or all students
- **Real-time Sync** — All data immediately visible to parents and students

### For Parents
- **Multi-Child Dashboard** — View all enrolled children from a single account
- **Grades & Reports** — Per-child grade breakdown with performance badges
- **Attendance History** — Detailed attendance with time, subject, and justification status
- **Resources** — Access all resources shared by teachers
- **Announcements** — View class and school announcements

### For Students
- **Personal Dashboard** — View own grades, attendance, and resources
- **Performance Tracking** — Score breakdown by subject with progress indicators
- **Resource Library** — Access study materials shared by teachers

### For Administrators
- **User Management** — Manage teachers, students, and parents
- **Class Management** — Create and assign classes
- **System Oversight** — Full access to all data and reports
- **Subject Management** — Define and manage subjects

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) |
| **Database** | [Neon PostgreSQL](https://neon.tech/) (Serverless) |
| **ORM** | [Prisma](https://www.prisma.io/) |
| **Auth** | JWT (jose) + bcryptjs |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Containerization** | Docker (multi-stage) |

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- A [Neon PostgreSQL](https://neon.tech/) database

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/annadjah.git
cd annadjah

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Neon database URL and JWT secret

# Push the database schema
npm run db:push

# Seed the database (optional)
npm run db:seed

# Start development server
npm run dev
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Neon PostgreSQL connection string | Yes |
| `JWT_SECRET` | Secret key for JWT token signing | Yes |

```env
DATABASE_URL="postgresql://user:pass@ep-xxx.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET="your-secure-random-secret"
```

## Docker Deployment

```bash
# Build the production image
npm run docker:build

# Start the container
npm run docker:up

# View logs
npm run docker:logs

# Stop the container
npm run docker:down
```

See [docker/README.md](docker/README.md) for detailed Docker documentation.

## Project Structure

```
annadjah/
├── app/                    # Next.js App Router pages
│   ├── (dashboard)/        # Protected dashboard routes
│   │   ├── admin/          # Admin dashboard
│   │   ├── teacher/        # Teacher dashboard
│   │   ├── parent/         # Parent dashboard
│   │   └── student/        # Student dashboard
│   └── api/                # REST API routes
├── components/             # React components
│   ├── admin/              # Admin-specific components
│   ├── teacher/            # Teacher-specific components
│   ├── viewer/             # Parent/Student shared components
│   └── ui/                 # Shared UI primitives
├── lib/                    # Utility functions and helpers
├── locales/                # i18n translation files
├── prisma/                 # Database schema and migrations
├── docker/                 # Docker deployment files
└── public/                 # Static assets
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run Next.js lint |
| `npm run db:push` | Push Prisma schema to database |
| `npm run db:seed` | Seed the database |
| `npm run docker:build` | Build Docker image |
| `npm run docker:up` | Start Docker container |
| `npm run docker:down` | Stop Docker container |
| `npm run docker:logs` | View Docker logs |

## License

MIT
