# Project Overview: Real Estate Microservices

This project is a microservices-based architecture for a real estate platform, utilizing a modern tech stack to handle property listings, notifications, and a user-facing frontend.

## 🏗️ High-Level Architecture

The system is split into three main components:
1.  **Frontend**: A Next.js application for the user interface.
2.  **Property Service**: A Python/FastAPI service managing property data and GraphQL queries.
3.  **Notification Service**: A Django-based service handling notifications, chat, blogs, and background jobs.

Communication between services is handled via **gRPC** (defined in `/proto`) and **Kafka**.

---

## 📁 Project Structure

```text
.
├── frontend/               # Next.js Frontend
│   ├── src/app/            # App router pages and layouts
│   ├── src/components/     # Reusable UI components
│   └── public/             # Static assets (images, videos)
│
├── property-service/       # Property Management Microservice (FastAPI)
│   ├── app/
│   │   ├── core/           # Business logic and configuration
│   │   ├── graphql/        # GraphQL schemas, queries, and mutations
│   │   ├── models/         # Database models
│   │   └── services/       # Internal service logic
│   ├── alembic/            # Database migrations
│   └── k8s/                # Kubernetes deployment manifests
│
├── notification-service/   # Notification & Social Microservice (Django)
│   ├── myapp/              # Core notification and auth logic
│   ├── chat/               # Real-time chat functionality
│   ├── blog/               # Blog and interaction system
│   ├── jobs/               # Background workers and scrapers
│   └── grpc_server/        # gRPC server for inter-service communication
│
├── proto/                  # Protobuf definitions for gRPC communication
│   └── user/               # User-related service definitions
│
├── dfd/                    # Data Flow Diagrams (Architectural Docs)
│   └── (various levels)     # Visual representations of system data flow
│
├── docker-compose.yml      # Root orchestration for local development
└── README.md               # General project documentation
```

---

## 🛠️ Tech Stack

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | Next.js, Tailwind CSS | User Interface & Experience |
| **Property Service** | Python, FastAPI, GraphQL | Property Listings & Search |
| **Notification Service**| Python, Django, PostgreSQL | Social, Notifications, Chat |
| **Communication** | gRPC, Kafka | Inter-service Messaging |
| **Database** | PostgreSQL, Redis | Persistence & Caching |
| **Infrastructure** | Docker, Kubernetes | Deployment & Orchestration |

---

## 🚀 Quick Start (Development)

To start the entire stack locally:

```bash
docker-compose up -d
```

This will spin up the Traefik gateway, the frontend, and both backend microservices.
