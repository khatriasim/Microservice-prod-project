# EstateHub microservices

EstateHub is a real-estate web application with a Next.js frontend and two backend services. Users can discover homes, save favourites, arrange viewings, read or publish blog content, and communicate through the chat service. Agents can create and manage their own listings and viewing requests.

## Features

- **Property discovery:** browse listings, filter by city, price, type, bedrooms, and bathrooms, and view listing details.
- **Personalised recommendations:** searches and saved properties build a preference profile; matching available listings are ranked for signed-in users.
- **Listings and viewings:** authenticated agents can create, update, or delete their own properties. Signed-in users can book or cancel a viewing; the listing agent can update its status.
- **Saved homes:** users can add or remove favourite properties.
- **Accounts:** registration, email OTP verification/resend, login/logout, password reset/change, profile updates, Google login, and cookie-based JWT authentication.
- **Community:** blog posts, categories, comments, post/comment likes, author follows, feeds, and read/unread notifications. An admin dashboard manages users, posts, categories, jobs, and notifications.
- **Messaging and jobs:** authenticated users can keep AI-chat conversations. They can also start a background job search and browse their matched job listings.
- **New-listing emails:** when an agent creates a property, the property service publishes a Kafka event; the notification service consumes it and Celery sends an email to active users.

## How it fits together

```text
Browser (Next.js, :3000)
        |
        v
Traefik gateway (:80) ── /graphql ──> FastAPI property service (:8000)
        |                                  | PostgreSQL + Redis
        └────────────── /api ───────────> Django notification service (:8001)
                                           | PostgreSQL + Redis + Celery

FastAPI -- property_created event --> Kafka --> Django consumer --> Celery email task
```

The frontend calls `http://localhost/graphql` for listing, favourite, recommendation, and booking operations, and `http://localhost/api/...` for Django-backed authentication, agents, blog, chat, and jobs. Traefik routes those paths to the correct container. Authentication is stored in HTTP-only cookies and sent with browser requests.

## Services

| Location | Responsibility | Main interface |
| --- | --- | --- |
| `frontend/` | Next.js 16 / React user interface | `http://localhost:3000` |
| `property-service/` | FastAPI property API, GraphQL, recommendations, favourites, and bookings | `http://localhost/graphql` |
| `notification-service/` | Django REST API, accounts, blog, notifications, chat, jobs, Celery tasks, and admin | `http://localhost/api/`, `/admin/`, `/api/docs/` |
| `docker-compose.yml` | Local stack: gateway, both services, two PostgreSQL databases, Redis instances, Kafka, consumer, and Celery worker | `http://localhost` |

## Run locally

Each service has its own `.env` file. Keep credentials and API keys there; do not commit them. Start the full backend stack from the repository root:

```bash
docker compose up --build
```

In a second terminal, start the frontend:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`. The Docker stack exposes the gateway at `http://localhost`, Traefik's dashboard at `http://localhost:8080`, the property database at port `5434`, and the notification database at port `5433`.

Useful development commands:

```bash
# FastAPI tests
cd property-service && pytest

# Django migrations or tests (with its environment configured)
cd notification-service && python manage.py migrate && python manage.py test

# Frontend linting
cd frontend && npm run lint
```

## Data and access rules

- Properties are stored by the FastAPI service; only the listing agent can change or delete a listing or update a property's booking status.
- Favourites, search history, and bookings are tied to the signed-in user. A duplicate booking for the same property returns the existing booking.
- The recommendation engine favours a user's searched and saved cities, property types, bedroom count, and price range, while excluding properties already saved.
- Django owns user accounts and community data. Its protected API endpoints require the JWT cookie (or JWT authorization); its interactive admin dashboard is at `/admin/`.
