# Task Manager

A full-stack Task Management application built using Django REST Framework and React. It allows users to organize daily tasks, manage categories, track progress, and stay productive.

## Live Application

- **Frontend:** https://task-manager-phi-plum.vercel.app/
- **Backend API:** https://task-manager-backend-4oc2.onrender.com/
- **Django Admin:** https://task-manager-backend-4oc2.onrender.com/admin/
- **GitHub Repository:** https://github.com/SaiAravindGoud/Task-Manager

## Features

### Authentication
- User registration and login
- JWT-based authentication
- Access token refresh
- Change password
- Protected routes

### Task Management
- Create, view, update, and delete tasks
- Mark tasks as completed
- Manage task status: Pending, In Progress, Completed
- Set priorities: Low, Medium, High
- Set task due dates
- Search, filter, sort, and paginate tasks

### Category Management
- Create categories
- Edit categories
- Delete categories

### Dashboard
- Total tasks
- Pending tasks
- In-progress tasks
- Completed tasks
- Overdue tasks

## Technology Stack

**Frontend**
- React
- Vite
- JavaScript
- Axios
- React Router
- Lucide React
- CSS

**Backend**
- Python
- Django
- Django REST Framework
- Django REST Framework Simple JWT
- django-filter
- PyMySQL

**Database**
- MySQL for local development
- PostgreSQL for production

**Deployment**
- Vercel – Frontend
- Render – Backend and PostgreSQL database
- GitHub – Source code management

## Project Structure

```text
Task-Manager/
├── backend/
│   ├── accounts/
│   ├── config/
│   ├── tasks/
│   ├── .env.example
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── public/
│   ├── src/
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
├── Screenshots/
├── .gitignore
└── README.md
```

## Requirements

- Python 3.12 or later
- Node.js and npm
- MySQL Server 8.0 or later for local development

## Local Installation

### 1. Clone the repository

```powershell
git clone https://github.com/SaiAravindGoud/Task-Manager.git
cd Task-Manager
```

### 2. Backend Setup

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Create a MySQL database named `task_manager_db`.

Create a `.env` file using `.env.example` as a reference. Configure your database credentials, Django secret key, debug settings, allowed hosts, and frontend URL.

Run database migrations:

```powershell
python manage.py migrate
```

Start the backend server:

```powershell
python manage.py runserver
```

Backend URL: http://127.0.0.1:8000/

### 3. Frontend Setup

Open another PowerShell window and navigate to the project frontend:

```powershell
cd Task-Manager\frontend
npm install
```

Create a `.env` file using `.env.example` as a reference and configure the backend API URL.

Start the frontend:

```powershell
npm run dev
```

Frontend URL: http://localhost:5173/

### 4. Production Build

From the frontend directory:

```powershell
npm run build
```

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register/` | Register user |
| POST | `/api/auth/login/` | User login |
| POST | `/api/auth/refresh/` | Refresh access token |
| GET | `/api/auth/me/` | Get current user |
| POST | `/api/auth/change-password/` | Change password |
| GET, POST | `/api/tasks/` | List and create tasks |
| GET, PUT, PATCH, DELETE | `/api/tasks/{id}/` | Manage a task |
| PATCH | `/api/tasks/{id}/toggle-complete/` | Toggle task completion |
| GET, POST | `/api/categories/` | List and create categories |
| GET, PATCH, DELETE | `/api/categories/{id}/` | Manage a category |
| GET | `/api/dashboard/` | Dashboard statistics |

## Security

- JWT authentication
- Protected API endpoints
- User-specific task and category access
- Environment variables for sensitive configuration
- Git ignore rules for secrets and generated files

## Testing

The application was tested for:

- User registration and login
- Dashboard statistics
- Task creation, editing, completion, and deletion
- Category creation, editing, and deletion
- Password change
- User data isolation

## Screenshots

Project screenshots are available in the `Screenshots/` directory in this repository.

## Author

Developed as a Full Stack Task Management project.
