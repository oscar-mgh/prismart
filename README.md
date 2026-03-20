## Prismart API

An commerce platform (stores, catalog, cart and orders) built with NestJS, TypeScript and MongoDB (Hexagonal architecture).  
It provides JWT-based authentication with roles (`CUSTOMER`, `SALES_ADMIN`, `SUPER_ADMIN`) and a promotion flow for turning a customer into a seller (`SALES_ADMIN`) with a system-managed `storeId`.

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

The API will be available by default at `http://localhost:3000`.

### Quick health check

```bash
GET /health
```

---

## Authentication & Roles Flow (summary)

- **Register** (`/auth/register`):
  - Creates a user with role **`CUSTOMER`** and **no `storeId`**.
  - The returned JWT **does not** include `storeId`.

- **Login** (`/auth/login`):
  - Returns a JWT with `sub`, `email`, `role` and, if the user is `SALES_ADMIN` and has a store, also `storeId`.

- **Promotion to SALES_ADMIN** (`/auth/promote`):
  - If the user exists, it ensures the user has role `SALES_ADMIN` and assigns a `storeId` if missing.
  - If the user does not exist, it builds a temporary (non-persisted) user with role `SALES_ADMIN` and a generated `storeId`.
  - In both cases, the returned JWT always includes `storeId` when `role` is `SALES_ADMIN`.

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
  - **Description**: promotes the user to `SALES_ADMIN` and returns a JWT that **always** includes `storeId` when the role is `SALES_ADMIN`.
  - **Body**:
    - `email: string`
    - `username: string` (4–40 chars)  
      - If the user already exists, `username` is only used when the user does not exist.
  - **Response**:
    - `{ token: string }` (JWT with `role: 'SALES_ADMIN'` and `storeId`).

- **DELETE `/auth/disable/:userId`**
  - **Roles**: `SUPER_ADMIN`
  - Disables a user.

- **PATCH `/auth/enable/:userId`**
  - **Roles**: `SUPER_ADMIN`
  - Enables a user.

### Stores (`/stores`)

- **POST `/stores`**
  - **Auth**: JWT required (any authenticated user).
  - Uses the `userId` from the JWT as the admin of the new store.
  - If the user already has a `storeId` and a store exists for it, a conflict is thrown.

- **GET `/stores/:id`**
  - Returns store information.

- **DELETE `/stores/:id`**
  - **Roles**: `SUPER_ADMIN`

### Products (`/products`)

- **POST `/products`**
  - **Auth**: JWT + role `SALES_ADMIN` or `SUPER_ADMIN`.
  - Uses the `storeId` from the JWT to associate the product with the store.

- **PATCH `/products/apply-discount`**
  - **Auth**: JWT + role `SALES_ADMIN` or `SUPER_ADMIN`.

- **DELETE `/products/:id`**
  - **Auth**: JWT + role `SALES_ADMIN` or `SUPER_ADMIN`.

### Cart (`/cart`)

- **GET `/cart`**
  - **Auth**: JWT.
  - Returns the cart of the authenticated user.

- **POST `/cart/items`**
  - **Auth**: JWT.
  - Uses `userId` and `storeId` from the JWT to add products to the cart.

- **POST `/cart/checkout`**
  - **Auth**: JWT.
  - Creates an order for the current user in the store indicated by `storeId`.

### Orders (`/orders`)

- **POST `/orders`**
  - **Auth**: JWT.
  - Creates an order for the authenticated user using their `storeId`.

- **GET `/orders/customer/:customerId`**
  - Returns all orders for a given customer.

- **GET `/orders/:id`**
  - Returns a specific order.

- **DELETE `/orders/:id`**
  - **Auth**: JWT.
  - Cancels the order and updates catalog stock using `storeId` from the JWT.

### Seed / Demo Data (`/seed`)

- **POST `/seed`**
  - **Roles**: `SUPER_ADMIN` only.
  - Creates a demo store called **"Prismart Demo Store"** (address in CDMX) and **25 furniture/home products** associated with it.
  - The store is assigned to the authenticated `SUPER_ADMIN` user.
  - **Idempotency**: if the demo store already exists, returns a `409 Conflict` error. Delete the store first to re-seed.
  - **Product specs**: prices between $899–$3999 MXN, stock between 2–9 units, category `hogar`, SKUs that match each product name.
  - **Response**:
    ```json
    {
      "storeId": "...",
      "storeName": "Prismart Demo Store",
      "productsCreated": 25
    }
    ```

---

## Quick dev testing notes

- Use tools like **Insomnia** or **Postman**:
  1. `POST /auth/register` → get a `CUSTOMER` `token`.
  2. `POST /auth/promote` with the same `email` → get a `SALES_ADMIN` `token` with `storeId`.
  3. With that token, try:
     - `POST /stores` (create store if it does not exist yet).
     - `POST /products` (create products for that store).
     - Cart and orders flow using the same JWT (which contains `storeId`).
