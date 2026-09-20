# EstateHub ER Diagram

EstateHub has **two PostgreSQL databases**: one for `property-service` (FastAPI) and one for `notification-service` (Django). The diagrams below use the Crow's Foot notation rendered by Mermaid. `PK` means primary key and `FK` means foreign key.

## 1. Property service database

```mermaid
erDiagram
    PROPERTY {
        int id PK
        string title
        text description
        float price
        int bedrooms
        int bathrooms
        float area
        string city
        string address
        string property_type
        string status
        int agent_id "Django User ID (logical FK)"
        string agent_name
        string agent_email
    }

    BOOKING {
        int id PK
        int property_id FK
        int buyer_id "Django User ID (logical FK)"
        datetime booking_date
        string status
    }

    FAVORITE {
        int id PK
        int property_id FK
        int user_id "Django User ID (logical FK)"
        datetime created_at
    }

    SEARCH_LOG {
        int id PK
        int user_id "Django User ID (logical FK)"
        string city
        float min_price
        float max_price
        int bedrooms
        string property_type
        datetime created_at
    }

    PROPERTY_USER {
        int id PK
        string name
        string email UK
        int age
        string hashed_password
        boolean is_admin
    }

    PROPERTY ||--o{ BOOKING : "has viewing bookings"
    PROPERTY ||--o{ FAVORITE : "is saved in"
```

`PROPERTY_USER` is a legacy FastAPI users table used by the service's REST user endpoints. The active GraphQL property flows instead identify users from the shared JWT and store the Django user ID in `agent_id`, `buyer_id`, and `user_id`; those values are **logical** rather than physical foreign keys. A property can have many bookings and favourites. Search logs are independent records used to calculate recommendations.

## 2. Notification service database

```mermaid
erDiagram
    USER {
        int id PK
        string username UK
        string email
        string password
        boolean is_staff
    }

    USER_PROFILE {
        int id PK
        int user_id FK "unique"
        boolean is_email_verified
        boolean is_agent
        string profile_image_url
    }

    CATEGORY {
        int id PK
        string name UK
        text description
        datetime created_at
    }

    POST {
        int id PK
        int author_id FK
        string title
        text content
        int views
        string status
        datetime created_at
        datetime updated_at
    }

    POST_CATEGORY {
        int post_id FK
        int category_id FK
    }

    COMMENT {
        int id PK
        int post_id FK
        int author_id FK
        text content
        datetime created_at
    }

    POST_LIKE {
        int id PK
        int post_id FK
        int user_id FK
        datetime created_at
    }

    COMMENT_LIKE {
        int id PK
        int comment_id FK
        int user_id FK
        datetime created_at
    }

    FOLLOW {
        int id PK
        int follower_id FK
        int following_id FK
        datetime created_at
    }

    NOTIFICATION {
        int id PK
        int user_id FK
        int sender_id FK
        int post_id FK "optional"
        string notification_type
        boolean is_read
        datetime created_at
    }

    CONVERSATION {
        int id PK
        int user_id FK
        string title
        datetime created_at
        datetime updated_at
    }

    MESSAGE {
        int id PK
        int conversation_id FK
        string role
        text content
        datetime created_at
    }

    JOB_LISTING {
        int id PK
        string title
        string company
        text location
        text url
        text description
        text source
        string status
        string linkedin_job_id UK
        datetime created_at
    }

    JOB_PROFILE {
        int id PK
        int user_id FK "unique"
        string job_type
        text job_keyword
        text location_preference
    }

    USER_JOB_MATCH {
        int id PK
        int user_id FK
        int job_id FK
        string title
        string company
        string location
        text link
        string searched_keyword
        datetime created_at
    }

    APPLIED_JOB {
        int job_profile_id FK
        int job_listing_id FK
    }

    USER ||--|| USER_PROFILE : "has account profile"
    USER ||--o{ POST : "authors"
    USER ||--o{ COMMENT : "writes"
    POST ||--o{ COMMENT : "contains"
    POST ||--o{ POST_LIKE : "receives"
    USER ||--o{ POST_LIKE : "creates"
    COMMENT ||--o{ COMMENT_LIKE : "receives"
    USER ||--o{ COMMENT_LIKE : "creates"
    POST ||--o{ POST_CATEGORY : "is classified by"
    CATEGORY ||--o{ POST_CATEGORY : "classifies"
    USER ||--o{ FOLLOW : "follower"
    USER ||--o{ FOLLOW : "following"
    USER ||--o{ NOTIFICATION : "receives"
    USER ||--o{ NOTIFICATION : "sends"
    POST o|--o{ NOTIFICATION : "references"
    USER ||--o{ CONVERSATION : "owns"
    CONVERSATION ||--o{ MESSAGE : "contains"
    USER ||--|| JOB_PROFILE : "has preferences"
    JOB_PROFILE ||--o{ APPLIED_JOB : "tracks"
    JOB_LISTING ||--o{ APPLIED_JOB : "is applied to"
    USER ||--o{ USER_JOB_MATCH : "has matches"
    JOB_LISTING ||--o{ USER_JOB_MATCH : "matches"
```

## Cross-service relationship

```mermaid
flowchart LR
    U["Django USER\nidentity and authentication"]
    P["PROPERTY\nagent_id"]
    B["BOOKING\nbuyer_id"]
    F["FAVORITE\nuser_id"]
    S["SEARCH_LOG\nuser_id"]

    U -. "shared JWT / logical user ID" .-> P
    U -. "shared JWT / logical user ID" .-> B
    U -. "shared JWT / logical user ID" .-> F
    U -. "shared JWT / logical user ID" .-> S
```

## Important constraints

- `POST_LIKE` is unique per `(post_id, user_id)` and `COMMENT_LIKE` per `(comment_id, user_id)`.
- `FOLLOW` is unique per `(follower_id, following_id)`.
- `USER_JOB_MATCH` is unique per `(user_id, job_id)`.
- `PROPERTY` to `BOOKING` and `PROPERTY` to `FAVORITE` are physical database foreign-key relationships. User references inside the property database are IDs validated through authentication, not cross-database constraints.
