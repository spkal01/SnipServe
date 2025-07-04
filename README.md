# PasteFrontEnd

A modern pastebin application built with React frontend and Flask backend, featuring syntax highlighting, private pastes, and user management.

## Features

- 🎨 **Modern UI** - Clean, responsive interface with dark/light theme support
- 🔐 **User Authentication** - Secure registration and login system
- 📝 **Paste Management** - Create, edit, delete, and share code snippets
- 🔒 **Privacy Controls** - Public or private paste visibility
- 📊 **View Tracking** - Track paste view counts
- 🔑 **API Access** - RESTful API with API key authentication
- 🎯 **Syntax Highlighting** - Beautiful code formatting
- 📱 **Responsive Design** - Works on desktop and mobile

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Lucide React** for icons

### Backend
- **Flask** with SQLAlchemy ORM
- **PostgreSQL** database
- **JWT** authentication
- **Bcrypt** password hashing
- **Gunicorn** WSGI server

## Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd PasteFrontEnd
   ```

2. **Start with Docker Compose**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost:4174
   - Backend API: http://localhost:5001
   - Database: localhost:5432

## Development Setup

### Frontend Development
```bash
npm install
npm run dev
```

### Backend Development
```bash
cd backend
pip install -r requirements.txt
python -m flask run
```

## Environment Variables

Create a `.env` file in the backend directory:

```env
SECRET_KEY=your-super-secret-key-here
INVITE_CODE=test
DB_HOST=db
DB_PORT=5432
DB_NAME=pastebin
DB_USER=pasteuser
DB_PASSWORD=pastepass
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Pastes
- `GET /api/pastes` - Get user's pastes
- `POST /api/pastes` - Create new paste
- `GET /api/pastes/{id}` - Get specific paste
- `PUT /api/pastes/{id}` - Update paste
- `DELETE /api/pastes/{id}` - Delete paste
- `POST /api/pastes/{id}/view` - Increment view count

### User
- `GET /api/user/profile` - Get user profile
- `POST /api/user/generate-api-key` - Generate new API key

## Project Structure

```
PasteFrontEnd/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── contexts/          # React contexts
│   └── utils/             # Utility functions
├── backend/               # Flask backend
│   └── snipserve/         # Backend package
│       ├── routes.py      # API routes
│       ├── models.py      # Database models
│       └── config.py      # Configuration
├── docker-compose.yml     # Docker orchestration
└── README.md
```

## Docker Services

- **frontend** - React application 
- **backend** - Flask API server 
- **db** - PostgreSQL database 

## License

This project is open source and available under the [MIT License](LICENSE).