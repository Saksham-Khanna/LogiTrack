# LogiTrack: Advanced Logistics and Shipment Management System

## Description
LogiTrack is a comprehensive full-stack logistics solution designed to streamline the shipment lifecycle from creation to final delivery. The platform provides a centralized hub for users to request shipments and for operators to manage the entire delivery workflow in real-time. By leveraging modern web technologies, LogiTrack ensures transparency and efficiency in the logistics process, offering immediate status updates through a dedicated tracking system.

## Key Features
- Shipment Creation: Intuitive interface for users to submit new delivery requests.
- Unique Tracking System: Every shipment is assigned a generated ID for granular tracking.
- Structured Lifecycle Management: Automated transitions through defined stages: Created, Accepted, On The Way, and Delivered.
- Real-time Communication: Integrated Socket.io for instant status alerts and cross-role notifications.
- Role-Based Access Control: Specialized dashboards and permissions for Users and Operators.
- Persistent Notification Center: Actionable history of shipment updates and system alerts.
- Advanced History & Filters: Searchable audit trail of all previous shipments with status-based filtering.
- Secure Authentication: JWT-based authentication system with protected routing and role verification.
- Predictive Analytics: Integrated ETA engine for estimating delivery durations based on distance and operational variables.
  
## Tech Stack
- Frontend: React.js (Vite), Tailwind CSS (v4), Lucide Icons
- Backend: Node.js, Express.js
- Database: MongoDB (Mongoose ODM)
- Real-time: Socket.io
- State Management: React Context API

## Installation and Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account or local MongoDB instance

### 1. Clone the Repository
```bash
git clone https://github.com/Saksham-Khanna/LogiTrack.git
cd LogiTrack
```

### 2. Configure Environment Variables
Create a .env file in the /server directory:
```env
PORT=6000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_random_string
NODE_ENV=production
```

### 3. Install Dependencies
Run the following from the root directory:
```bash
npm install
cd client && npm install
cd ../server && npm install
```

### 4. Build and Start
To build the frontend and start the production server:
```bash
# From the root directory
npm run build
npm start
```

For development mode (running both client and server):
```bash
npm run dev
```

## API Endpoints

### Authentication
- POST /api/auth/register: User registration (Role: user or operator)
- POST /api/auth/login: User authentication
- GET /api/auth/me: Retrieve current user profile

### Shipments
- GET /api/shipments: List all shipments (filtered by role)
- POST /api/shipments: Create a new shipment (User only)
- GET /api/shipments/:trackingId: Retrieve specific shipment details
- PATCH /api/shipments/:id/status: Update shipment status (Operator only)
- GET /api/shipments/stats/dashboard: Retrieve analytical metrics

## Folder Structure
```text
/LogiTrack
├── /client           # React Application
│   ├── /src
│   │   ├── /components  # UI Layouts (TopBar, Sidebar, etc.)
│   │   ├── /context     # Auth, Socket, and Notification state
│   │   ├── /pages       # Dashboard, Tracking, History, etc.
│   │   └── /services    # API communication layer
├── /server           # Node.js Express Backend
│   ├── /models          # Database Schemas (User, Shipment)
│   ├── /routes          # API Endpoints
│   ├── /middleware      # Auth & Protection logic
│   └── /services        # Business logic & ETA engine
├── package.json      # Root orchestration scripts
└── .gitignore        # Version control exclusions
```

## Future Improvements
- Interactive Map Integration: Real-time visual tracking of shipments on a live map.
- Payment Gateway: Integrated billing and transaction history for deliveries.
- Enhanced Machine Learning: Refined ETA predictions using historical delivery data and traffic patterns.
- Multi-currency Support: Support for international logistics and pricing.

## Author
Saksham Khanna
GitHub: [Saksham-Khanna](https://github.com/Saksham-Khanna)
