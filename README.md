# Event Platform 🎉

A full-stack web application for discovering, creating, and registering for community events. Built with Next.js, Express, and PostgreSQL.


## 🌐 Live Demo

- **Frontend**: https://event-platform-flax-five.vercel.app/
- **Backend API**: https://event-platform-api-7khw.onrender.com/
- **Database**: Supabase (Managed)

## 🌟 Features

- **Browse Events**: Discover upcoming events with search and filtering
- **User Authentication**: Secure login and registration with JWT tokens
- **Event Registration**: Register/unregister for events with capacity management
- **Admin Dashboard**: Create and manage events (admin users only)
- **My Events**: View all registered events in one place
- **Calendar Integration**: Add events to Google Calendar
- **Yelp Integration**: Populate events from Yelp API

## 🏗️ Architecture
```
event-platform/
├── backend/              # Express.js API
│   ├── src/
│   │   ├── controllers/  # Route handlers
│   │   ├── models/       # Database queries
│   │   ├── routes/       # API endpoints
│   │   ├── middleware/   # Auth & error handling
│   │   ├── utils/        # Helpers (JWT, bcrypt)
│   │   ├── db/          # Database setup & seeds
│   │   └── types.ts     # TypeScript types
│   └── package.json
│
└── frontend/             # Next.js App
    ├── src/
    │   ├── app/         # Pages & layouts
    │   ├── components/  # React components
    │   ├── lib/        # API client & utilities
    │   └── store/      # Zustand state management
    └── package.json
```

## 🚀 Tech Stack

### Backend
- **Runtime**: Node.js 22
- **Framework**: Express.js 5
- **Database**: PostgreSQL (Supabase)
- **Auth**: JWT (jsonwebtoken)
- **Security**: bcrypt, CORS
- **Language**: TypeScript
- **Testing**: Jest + Supertest

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI**: React 19
- **Styling**: Tailwind CSS 4
- **State**: Zustand
- **API Client**: Axios
- **Icons**: React Icons
- **Calendar**: add-to-calendar-button-react

### Deployment
- **Backend**: Render
- **Frontend**: Vercel
- **Database**: Supabase

## 📋 Prerequisites

- Node.js 22+
- npm or yarn
- PostgreSQL (or Supabase account)
- Git

## 🔧 Local Development Setup

### 1. Clone Repository
```bash
git clone https://github.com/Darkon101/event-platform.git
cd event-platform
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create .env.development
cat > .env.development << EOF
NODE_ENV=development
PGDATABASE=event_platform
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
YELP_API_KEY=your_yelp_api_key
EOF

# Setup databases
npm run setup-dbs

# Seed development data
npm run seed-dev

# Start backend
npm start
```

Backend runs on `http://localhost:9090`

### 3. Frontend Setup
```bash
cd frontend
npm install

# Create .env.local
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:9090/api
EOF

# Start frontend
npm run dev
```

Frontend runs on `http://localhost:3000`

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Users
- `GET /api/users` - List all users (admin only)
- `GET /api/users/:username` - Get user profile
- `PATCH /api/users/:username` - Update user profile
- `DELETE /api/users/:username` - Delete user account

### Events
- `GET /api/events` - List all events (with filters)
- `GET /api/events/:id` - Get event details
- `POST /api/events` - Create event (admin only)
- `PATCH /api/events/:id` - Update event (admin only)
- `DELETE /api/events/:id` - Delete event (admin only)
- `GET /api/events/creator/:username` - Get events by creator (admin only)

### Registrations
- `POST /api/events/:id/register` - Register for event
- `DELETE /api/events/:id/register` - Unregister from event
- `GET /api/events/:id/registrations` - Get event registrations (admin only)
- `GET /api/users/:username/registrations` - Get user registrations

## 🧪 Testing
```bash
cd backend
npm test
npm test -- --watch
```

## 🌱 Populate Events from Yelp
```bash
cd backend

# Set YELP_API_KEY in .env.development
# Get it from https://www.yelp.com/developers

npm run fetch-events
npm run seed-dev
```

Modify `EVENT_CATEGORY` in `src/scripts/fetch-yelp-events.ts` to fetch different event types:
- music, festivals, food-and-drink, sports-active-life, nightlife, visual-arts, performing-arts

## 👥 Test Accounts
```
Username: testuser
Password: password123
isAdmin: false

Username: testadmin
Password: admin123
isAdmin: true
```

## 📦 Production Deployment

### Backend (Render)

1. Push to GitHub
2. Create Render web service
3. Connect GitHub repository
4. Set environment variables:
   - NODE_ENV=production
   - DATABASE_URL=your-supabase-url
   - JWT_SECRET=your-secret-key
   - JWT_EXPIRES_IN=7d
   - PGDATABASE=postgres
5. Build command: `cd backend && npm install && npm run build`
6. Start command: `node backend/dist/listen.js`
7. Deploy

### Frontend (Vercel)

1. Push to GitHub
2. Go to https://vercel.com
3. Click "Add New" → "Project"
4. Import your GitHub repository
5. Vercel auto-detects Next.js
6. Set environment variable:
   - NEXT_PUBLIC_API_URL=https://your-render-api.onrender.com/api
7. Click "Deploy"

### Database (Supabase)

1. Create project at https://supabase.com
2. Get connection string from Settings → Database
3. Use as DATABASE_URL in Render environment
4. Run seed on production:
```bash
   NODE_ENV=production npm run seed-prod
```

## 🔐 Environment Variables

### Backend .env.development
```
NODE_ENV=development
PGDATABASE=event_platform
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
YELP_API_KEY=your_yelp_api_key
```

### Backend .env.production
```
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:port/dbname
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d
PGDATABASE=postgres
PORT=10000
```

### Frontend .env.local (Development)
```
NEXT_PUBLIC_API_URL=http://localhost:9090/api
```

### Frontend Environment (Vercel)
```
NEXT_PUBLIC_API_URL=https://your-render-api.onrender.com/api
```

## 📊 Database Schema

### Users Table
```
- username (PRIMARY KEY)
- name
- email (UNIQUE)
- password (hashed with bcrypt)
- isAdmin (DEFAULT: false)
- created_at (TIMESTAMP)
```

### Events Table
```
- event_id (PRIMARY KEY)
- title
- description
- location
- date
- capacity
- price
- created_by (FK → users.username)
- external_id (Yelp ID)
- image_url
- url
- created_at (TIMESTAMP)
```

### Event Registrations Table
```
- registration_id (PRIMARY KEY)
- event_id (FK → events.event_id)
- username (FK → users.username)
- registered_at (TIMESTAMP)
- UNIQUE(event_id, username)
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 🐛 Troubleshooting

### Backend won't start
- Check DATABASE_URL is correct
- Ensure PostgreSQL is running locally
- Verify .env.development file exists
- Run `npm install` to install dependencies

### Frontend can't reach API
- Verify NEXT_PUBLIC_API_URL is correct
- Check CORS is enabled in backend (should be by default)
- Look for errors in browser console
- Ensure backend is running and accessible

### Events not showing
- Confirm seed script ran successfully
- Check database: `SELECT COUNT(*) FROM events;`
- Verify API endpoint: `curl http://localhost:9090/api/events`
- Check Render or local logs for errors

### Supabase connection fails
- Verify DATABASE_URL is correct
- Check password doesn't have special characters that need URL encoding
- Ensure firewall allows database connections
- Test connection string locally first

## 🎯 Future Roadmap

- Email notifications for event reminders
- Event reviews and ratings
- Social sharing features
- Event categories and tags
- Advanced filtering and sorting
- User profile customization
- Event image uploads
- Payment integration for paid events
- Event notifications
- User follow system
