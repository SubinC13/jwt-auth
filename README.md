TPS Order & Transaction Management

Stack
- Backend: Node.js, Express, TypeScript, Mongoose, Zod, JWT, Socket.IO
- Frontend: React (Vite) + TypeScript + Tailwind, Axios, React Router, Socket.IO client
- DB: MongoDB
- Docker: Dockerfiles per service + docker-compose

Structure
- server: API service (TS)
- client: Web app (Vite + TS + Tailwind)

Add .env inside the server 
   MONGO_URI=mongodb://localhost:27018
   
   JWT_SECRET='h76sdf1w3sdfdfi@sdfsf'
   
   CORS_ORIGIN=http://localhost:3000
   
   PORT=5001
   

Local Development (without Docker)
1) API
   - cd server
   - npm install
   - set env vars (MONGO_URI, JWT_SECRET, CORS_ORIGIN, PORT)
   - npm run dev
   - API: http://localhost:5001/api

2) Web
   - cd client
   - npm install
   - npm run dev
   - App: http://localhost:3000

Docker
- docker compose up --build
- Frontend: http://localhost:3000
- Backend: http://localhost:5001/api
- MongoDB: localhost:27017

API Summary
- POST /api/auth/register
- POST /api/auth/login
- POST /api/orders (auth)
- GET /api/orders (auth, filter ?status=Pending|Completed|Failed)
- PATCH /api/orders/:id (auth, owner or admin)
- POST /api/transactions (auth)
- GET /api/transactions (auth)

Socket.IO
- Server emits 'transaction:new' on new transaction
- Client listens on Real-Time page

Notes
- Basic RBAC: admin can see all orders, customer sees own
- Validation with Zod across endpoints
