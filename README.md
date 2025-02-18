
# Social Media App

A full-stack social media application built with React (frontend), Flask (backend), and MySQL (database). The project is containerized using Docker Compose for easy deployment.

## Features
- User authentication
- Create, delete posts
- Read, Like posts
- User profiles with followers/following system
- Real-time notifications
- Admin controls
- Email notifications

## Tech Stack
- **Frontend:** React
- **Backend:** Flask,
- **Database:** MySQL
- **Containerization:** Docker

## Prerequisites
### Run locally
- Node.js
- Vite
- Python
- MySQL Server

### Run in a container
- Docker
- Docker Compose

## Setup and Installation

1. **Clone the repository**
   ```sh
   git clone https://github.com/MDugalic/DRS-App
   cd DRS-App
   ```

2. **Create an `.env` file** (for environment variables)
   ```sh
   touch .env
   ```
   Add the following (update values as needed):
   ```ini
   MYSQL_ROOT_PASSWORD=rootpassword
   MYSQL_DATABASE=socialmedia
   MYSQL_USER=user
   MYSQL_PASSWORD=password
   SECRET_KEY=your_secret_key
   ```

3. **Start the application using Docker Compose**
   ```sh
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:5000`
   - MySQL: `localhost:3306`