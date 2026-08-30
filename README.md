# Rita Jeans — E-Commerce Platform

Premium denim retailer e-commerce website for Rita Jeans, with locations in **La Paz** and **Ablekuma**, Accra, Ghana.

## Tech Stack

| Layer      | Technology                     |
|------------|--------------------------------|
| Frontend   | React (Vite) + React Router   |
| Backend    | Node.js + Express              |
| Database   | MongoDB (Mongoose)             |
| Auth       | JWT (admin only)               |
| Images     | Multer (local `/uploads`)      |
| Styling    | Vanilla CSS (custom design)    |

## Features

### Customer-Facing
- Homepage with hero banner, categories, flash sales, new arrivals
- Product catalog with category filters, search, sort, pagination
- Product detail page with image gallery, reviews, size selector
- Flash sale countdown timers
- Shopping cart (localStorage-backed)
- Wishlist (localStorage-backed)
- Guest checkout — order via WhatsApp/call confirmation
- Free delivery for Ablekuma; configurable fee for other locations
- Floating WhatsApp + Call buttons on every page
- Product sharing (Web Share API + WhatsApp fallback)
- Referral tracking via URL parameters

### Admin Dashboard
- JWT-protected login
- Dashboard with analytics (orders, revenue, best sellers)
- Product CRUD with image upload
- Order management with status updates
- Review moderation (approve/hide/delete)

## Prerequisites

- **Node.js** v18+ and npm
- **MongoDB Atlas** account (free tier works) OR local MongoDB
- **Git**

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd rita
```

### 2. Backend Setup

```bash
cd server
cp .env.example .env
```

Edit `.env` with your values:
```
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/ritajeans?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this
NODE_ENV=development
CLIENT_URL=http://localhost:5173
DEFAULT_DELIVERY_FEE=20
```

Install dependencies and seed the database:
```bash
npm install
npm run seed
```

Start the dev server:
```bash
npm run dev
```

The API will be running at `http://localhost:5000`.

### 3. Frontend Setup

```bash
cd ../client
npm install
npm run dev
```

The frontend will be running at `http://localhost:5173`.

### 4. MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas) and create a free cluster
2. Create a database user with a password
3. Add your IP address to the Access List (or use `0.0.0.0/0` for development)
4. Get the connection string and paste it into `server/.env` as `MONGODB_URI`

### 5. Default Admin Credentials

After running `npm run seed`, log in at `/admin/login` with:
- **Email:** `admin@ritajeans.com`
- **Password:** `changeme123`

> ⚠️ **Change the password immediately** after first login.

## Project Structure

```
rita/
├── client/                 # React (Vite) frontend
│   ├── src/
│   │   ├── api/            # Axios API helpers
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React Context (Cart, Wishlist, Auth)
│   │   ├── hooks/          # Custom hooks (useCountdown)
│   │   ├── pages/          # Route-level pages + admin/
│   │   ├── styles/         # CSS (design system + components + admin)
│   │   ├── utils/          # Helper functions
│   │   ├── App.jsx         # Root component with routing
│   │   └── main.jsx        # Entry point
│   └── ...
├── server/                 # Node.js + Express backend
│   ├── config/             # DB connection
│   ├── controllers/        # Route handlers
│   ├── middleware/          # Auth, upload, error handling
│   ├── models/             # Mongoose schemas
│   ├── routes/             # Express routes
│   ├── seed/               # Database seeder
│   ├── uploads/            # Product images
│   └── server.js           # App entry point
└── README.md
```

## API Endpoints

### Public
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/products` | List products (filter, search, paginate) |
| GET | `/api/products/:id` | Get single product |
| GET | `/api/products/categories` | Get category list |
| GET | `/api/reviews/:productId` | Get approved reviews |
| POST | `/api/reviews` | Submit a review |
| POST | `/api/orders` | Place an order |
| POST | `/api/customers` | Register customer |
| GET | `/api/settings` | Get public settings |

### Admin (requires JWT)
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/admin/login` | Admin login |
| POST | `/api/products` | Create product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |
| GET | `/api/orders` | List orders |
| PUT | `/api/orders/:id/status` | Update order status |
| GET | `/api/orders/analytics` | Dashboard analytics |
| PUT | `/api/reviews/:id/approve` | Toggle review approval |
| PUT | `/api/settings` | Update settings |

## Deployment

### Frontend (Vercel or Netlify)

1. Connect your GitHub repo
2. Set build command: `cd client && npm run build`
3. Set output directory: `client/dist`
4. Add environment variable: `VITE_API_URL=https://your-api.onrender.com`

### Backend (Render or Railway)

1. Connect your GitHub repo
2. Set root directory: `server`
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add all environment variables from `.env`

### Database (MongoDB Atlas)

1. Use the free M0 tier
2. Whitelist your deployment platform's IP (or `0.0.0.0/0`)
3. Use the connection string in your backend's `MONGODB_URI`

## Business Rules

- **Delivery:** Free for Ablekuma; configurable flat fee for La Paz and other locations
- **Flash Sales:** Active only between `saleStartsAt` and `saleEndsAt`
- **Discounts:** `discountedPrice = price - (price × discountPercent / 100)`
- **Reviews:** Only approved reviews affect the product's average rating
- **Referrals:** Tracked via `?ref=CODE` URL parameter, stored on orders

## Contact

**Rita Jeans** — 059 217 7477  
La Paz & Ablekuma, Accra, Ghana
