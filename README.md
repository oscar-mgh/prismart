## Prismart API

A commerce platform (stores, catalog, cart, orders, and reviews) built with NestJS, TypeScript and MongoDB (Hexagonal architecture).  
It provides JWT-based authentication with roles (`CUSTOMER`, `SALES_ADMIN`, `SUPER_ADMIN`, `SUPPORT`). A `SUPER_ADMIN` can promote users to `SALES_ADMIN` with a system-managed `storeId`.

---

## API base URL and docs

All HTTP routes listed below are served **under the global prefix** `api/v1`.

- **Example base:** `http://localhost:3000/api/v1`
- **OpenAPI (Swagger UI):** `http://localhost:3000/api/docs`

---

## Quick Start (Development)

### Requirements

- **Node.js** >= 18  
- **npm** >= 9  
- **MongoDB** running (local or remote)

### Environment variables

Copy the template and fill in the values:

```bash
cp .env.template .env
```

#### Quick example

```bash
API_PORT=3000

MONGO_URI=mongodb://localhost:27017/prismart

JWT_SECRET=super-secret-key
JWT_EXPIRES_IN=24h

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Optional – comma-separated allowed origins (default: *)
CORS_ORIGIN=http://localhost:3000,http://localhost:5173

# Optional – bootstrap a SUPER_ADMIN user on startup
SUPER_ADMIN_EMAIL=admin@prismart.local
SUPER_ADMIN_PASSWORD=temporalpassword
SUPER_ADMIN_USERNAME=superadmin
```

#### Variable reference

| Variable | Required | Default | Description |
|---|---|---|---|
| `API_PORT` | No | `3000` | Port on which the HTTP server listens. |
| `MONGO_URI` | **Yes** | `mongodb://localhost:27017/prismart` | MongoDB connection string. |
| `JWT_SECRET` | **Yes** | — | Secret key used to sign and verify JWTs. |
| `JWT_EXPIRES_IN` | **Yes** | — | Token lifetime (e.g. `24h`, `7d`, `3600`). |
| `CLOUDINARY_CLOUD_NAME` | **Yes** | — | Cloudinary cloud name for image uploads. |
| `CLOUDINARY_API_KEY` | **Yes** | — | Cloudinary API key. |
| `CLOUDINARY_API_SECRET` | **Yes** | — | Cloudinary API secret. |
| `CORS_ORIGIN` | No | `*` | Allowed CORS origins (comma-separated) or `*`. |
| `SUPER_ADMIN_EMAIL` | No | — | Email for the auto-bootstrapped super-admin. |
| `SUPER_ADMIN_PASSWORD` | No | — | Password for the auto-bootstrapped super-admin. |
| `SUPER_ADMIN_USERNAME` | No | — | Username for the auto-bootstrapped super-admin. |

> **Note:** If all three `SUPER_ADMIN_*` variables are set, a `SUPER_ADMIN` user is created automatically on startup. Omit them to skip this step.

### Install dependencies

```bash
npm install
```

### Run the server

```bash
# development with autoreload
npm run start:dev

# or simple run
npm run start
```

The API will be available by default at `http://localhost:3000` (routes under `http://localhost:3000/api/v1/...`).

### Quick health check

```bash
GET /api/v1/health
```

Checks the API and MongoDB connectivity (via `@nestjs/terminus`).

---

## Authentication & Roles Flow (summary)

- **Register** (`POST /api/v1/auth/register`):
  - Creates a user with role **`CUSTOMER`** and **no `storeId`**.
  - The returned JWT **does not** include `storeId`.

- **Login** (`POST /api/v1/auth/login`):
  - Returns a JWT with `sub`, `email`, `role` and, if the user is `SALES_ADMIN` and has a store, also `storeId`.

- **Promotion to SALES_ADMIN** (`POST /api/v1/auth/promote`):
  - **Auth:** JWT required. **Roles:** **`SUPER_ADMIN` only.**
  - If the user exists, ensures role `SALES_ADMIN` and assigns a `storeId` if missing.
  - If the user does not exist, builds a temporary (non-persisted) user with role `SALES_ADMIN` and a generated `storeId`.
  - Response is `{ token }` with `storeId` when the role is `SALES_ADMIN`.

JWT payload examples:

- `CUSTOMER` user:

```ts
{
  sub: string;
  email: string;
  role: 'CUSTOMER';
  // no storeId
}
```

- `SALES_ADMIN` user:

```ts
{
  sub: string;
  email: string;
  role: 'SALES_ADMIN';
  storeId: string;
}
```

---

## Main Endpoints

Paths below are relative to the API root (prefix **`/api/v1`**).

### Auth (`/auth`)

- **POST `/auth/register`**
  - **Body**:
    - `username: string` (4–40 chars)
    - `email: string` (valid email)
    - `password: string` (min. 8 chars)
  - **Response**: user data + `token` (JWT as `CUSTOMER` without `storeId`).

- **POST `/auth/login`**
  - **Body**:
    - `email: string`
    - `password: string`
  - **Response**: user data + `token` (JWT with `role` and, if applicable, `storeId`).

- **POST `/auth/promote`**
  - **Auth:** JWT. **Roles:** `SUPER_ADMIN` only.
  - **Body**:
    - `email: string`
    - `username: string` (4–40 chars) — used when creating a new user; ignored for existing users except flow validation.
  - **Response:** `{ token: string }` (JWT with `role: 'SALES_ADMIN'` and `storeId`).

- **DELETE `/auth/disable/:userId`**
  - **Auth:** JWT. **Roles:** `SUPER_ADMIN`
  - Disables a user.

- **PATCH `/auth/enable/:userId`**
  - **Auth:** JWT. **Roles:** `SUPER_ADMIN`
  - Enables a user.

### Stores (`/stores`)

- **POST `/stores`**
  - **Auth:** JWT (any authenticated user).
  - Uses the `userId` from the JWT as the admin of the new store.
  - If the user already has a `storeId` and a store exists for it, a conflict is thrown.

- **GET `/stores/:id`**
  - **Auth:** JWT.
  - Returns store information.

- **DELETE `/stores/:id`**
  - **Auth:** JWT. **Roles:** `SUPER_ADMIN`

### Products 

- **GET `/products/categories`**
  - Public. Returns distinct category names.

- **GET `/products`**
  - Public. Paginated catalog. Query: `page`, `limit`, optional `sortBy` (`recent`, `price_high`, `price_low`, `best_selling`, `best_rated`).  
  - Response includes products with aggregated average rating where applicable.

- **GET `/products/criteria`**
  - Public. Filter/search: optional `ids`, `skus`, `category`, `active`, `page`, `limit`, `sortByPurchaseCount` (`asc` | `desc`).

- **GET `/products/:id`**
  - **Auth:** JWT.
  - Single product including average rating.

- **POST `/products`**
  - **Auth:** JWT. **Roles:** `SALES_ADMIN` or `SUPER_ADMIN`.
  - Requires `storeId` on the user; associates the product with that store.

- **PATCH `/products/apply-discount`**
  - **Auth:** JWT. **Roles:** `SALES_ADMIN` or `SUPER_ADMIN`.
  - Body targets products by criteria (`ids`, `skus`, `category`) and applies discount fields (`code`, `percentage`, `expirationDate`).

- **POST `/products/:id/image`**
  - **Auth:** JWT. **Roles:** `SALES_ADMIN` or `SUPER_ADMIN`.
  - `multipart/form-data` field **`file`** (Cloudinary upload).

- **DELETE `/products/:id`**
  - **Auth:** JWT. **Roles:** `SALES_ADMIN` or `SUPER_ADMIN`

### Cart (`/cart`)

- **Auth:** JWT. **Roles:** `CUSTOMER`, `SALES_ADMIN`, or `SUPPORT`.

- **GET `/cart`**
  - Returns the cart of the authenticated user.

- **POST `/cart/items`**
  - Adds a line item (body per `AddItemDto`; uses authenticated `userId`).

- **POST `/cart/checkout`**
  - Creates an order from the current cart (HTTP 201).

- **DELETE `/cart`**
  - Deletes the authenticated user’s cart (HTTP 204).

### Orders (`/orders`)

- **Auth:** JWT on all routes below (with role checks where noted).

- **POST `/orders`**
  - Creates an order for the authenticated user (`customerId` from JWT) from **`items`** in the body (product ids and quantities). Updates stock from catalog.

- **GET `/orders/all`**
  - **Roles:** `SUPPORT` or `SUPER_ADMIN`.
  - Returns orders across customers.

- **GET `/orders/customer/:customerId`**
  - **Must** match the authenticated user’s id (`customerId` === JWT `sub`); otherwise 403.

- **GET `/orders/:id`**
  - Single order if it belongs to the authenticated customer; otherwise 403.

- **DELETE `/orders/:id`**
  - Cancels a **pending** order owned by the authenticated user. Restores product stock for the order line items (transactional). HTTP 204.

### Reviews (`/reviews`)

- **POST `/reviews`**
  - **Auth:** JWT.
  - **Body:** `productId`, `title` (4–100 chars), `description` (30–1000 chars), `rating` (1–5), optional `reviewImage`.

- **PATCH `/reviews/:id`**
  - **Auth:** JWT. Owner can update their review.

- **DELETE `/reviews/:id`**
  - **Auth:** JWT. Owner can delete their review (HTTP 204).

- **GET `/reviews/product/:productId`**
  - Public (paginated). Query: `page`, `limit`.

- **GET `/reviews/:id`**
  - Public. Single review.

- **POST `/reviews/:id/image`**
  - **Auth:** JWT. `multipart/form-data` field **`file`**.

### Seed / Demo Data (`/seed`)

- **POST `/seed`**
  - **Auth:** JWT. **Roles:** `SUPER_ADMIN` only.
  - Creates a demo store called **"Prismart Demo Store"** (address in CDMX) and **25 furniture/home products** associated with it.
  - The store is assigned to the authenticated `SUPER_ADMIN` user.
  - **Idempotency**: if the demo store already exists, returns a `409 Conflict` error. Delete the store first to re-seed.
  - **Product specs**: prices between approx. $899–$3999 MXN, stock between 2–9 units, category `hogar`, SKUs aligned with product names.
  - **Response** (201):
    ```json
    {
      "storeId": "...",
      "storeName": "Prismart Demo Store",
      "productsCreated": 25
    }
    ```

---

## Quick dev testing notes

- Use **Insomnia**, **Postman**, or **Swagger** at `/api/docs`.
- Typical flow:
  1. Ensure a `SUPER_ADMIN` exists (env bootstrap or your own seeding).
  2. `POST /api/v1/auth/login` as `SUPER_ADMIN` → `token`.
  3. `POST /api/v1/auth/promote` with that token and target `email` / `username` → `SALES_ADMIN` `token` with `storeId`.
  4. With the sales-admin token: `POST /api/v1/stores` if needed, then `POST /api/v1/products`, image upload, discounts, etc.
  5. As a customer: register/login, browse `GET /api/v1/products`, cart, checkout or `POST /api/v1/orders`, reviews.
