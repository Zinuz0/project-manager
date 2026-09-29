# Real-Time Kanban Project Manager

A full-stack, collaborative project management application built with the MERN stack, Socket.io, and Redis. Features interactive drag-and-drop Kanban boards, granular Role-Based Access Control (RBAC), real-time notifications, task comment threads, and activity logging.

---

## 🌟 Key Features

- 📋 **Interactive Drag-and-Drop Kanban Board**: Categorize tasks across status columns (`TODO`, `IN_PROGRESS`, `COMPLETED`) with instant state synchronization via `@hello-pangea/dnd`.
- 👥 **Role-Based Access Control (RBAC)**: Hierarchical permissions enforcing strict boundaries for **OWNER** (project creator), **ADMIN**, and **MEMBER** roles.
- ⚡ **Real-Time WebSockets & Scalability**: Multi-client synchronization powered by **Socket.io** and scaled horizontally with a **Redis Pub/Sub Adapter**.
- 🔔 **Targeted Room Notifications**: Personal and project-level socket rooms providing instant alerts for member additions, task assignments, and updates.
- 💬 **Collaborative Task Threads**: Commenting system per task with activity feeds tracking project history.
- 🔐 **Secure Authentication**: JWT-based authentication with encrypted passwords using `bcryptjs`.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19, Vite
- **Routing**: React Router v7
- **Drag and Drop**: `@hello-pangea/dnd`
- **Real-Time Client**: Socket.io Client
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ORM)
- **Real-Time Engine**: Socket.io
- **Pub/Sub Adapter**: Redis (`@socket.io/redis-adapter`)
- **Authentication**: JSON Web Tokens (JWT), `bcryptjs`

---

## 📁 Project Structure

```text
KANBAN-project-manager-main/
├── client/                 # React 19 Frontend (Vite)
│   ├── src/
│   │   ├── api/            # Axios instance & API calls
│   │   ├── components/     # Reusable UI components & Task Modals
│   │   ├── context/        # React Context (Auth & Socket states)
│   │   ├── pages/          # Dashboard, Project Details, Login/Register
│   │   └── socket/         # Socket.io connection setup
│   └── package.json
│
├── server/                 # Express & Node.js Backend
│   ├── config/             # DB & Redis connection settings
│   ├── controllers/        # Auth, Project, Task, Comment, Notification controllers
│   ├── middleware/         # Auth & Role verification middleware
│   ├── models/             # Mongoose schemas (User, Project, Task, Comment, Activity)
│   ├── routes/             # RESTful API route definitions
│   ├── sockets/            # Socket event handlers & room logic
│   ├── server.js           # Express server entrypoint & Redis socket adapter setup
│   └── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **MongoDB** (Local instance or MongoDB Atlas URI)
- **Redis Server** running locally on port `6379` (or configured via connection string)

### 1. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file inside the `server/` directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/kanban_db
JWT_SECRET=your_jwt_secret_key_here
REDIS_URL=redis://localhost:6379
```

Start the backend development server:

```bash
npm run dev
```

### 2. Frontend Setup

In a new terminal window:

```bash
cd client
npm install
npm run dev
```

The application will be available at `http://localhost:5173`.

---

## 🔌 API Endpoints Summary

- **Auth**: `/api/auth/register`, `/api/auth/login`
- **Projects**: `/api/projects` (CRUD operations & member role assignments)
- **Tasks**: `/api/tasks` (Task creation, assignment, status update)
- **Comments**: `/api/comments` (Task comment management)
- **Notifications**: `/api/notifications` (Fetch user notifications)
- **Activities**: `/api/activities` (Fetch project activity logs)

---

## 📜 License

This project is open-source and available under the [MIT License](LICENSE).
