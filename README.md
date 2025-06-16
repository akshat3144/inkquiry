# InkQuiry

InkQuiry is a powerful handwritten mathematics recognition application that allows users to draw mathematical expressions and equations, which are then analyzed and solved in real-time.

![InkQuiry Logo](frontend/public/logo.png)

## 🚀 Features

- **Handwritten Math Recognition**: Draw mathematical expressions and formulas directly on the canvas
- **Real-time Calculation**: Get instant solutions to your handwritten equations
- **Variable Assignment**: Define and use variables across your calculations
- **Notebook Interface**: Save and organize your work in a notebook-style interface
- **User Authentication**: Secure user accounts with authentication
- **Responsive Design**: Works across desktop and mobile devices
- **Dark/Light Mode**: Customize your viewing experience

## 🏗️ Project Structure

The InkQuiry project is divided into two main parts:

### Backend (Python/FastAPI)

The backend is built with FastAPI and provides the following functionality:

- **Authentication API**: User registration, login, and token management
- **Calculator API**: Processes handwritten mathematics and returns solutions
- **Notebook API**: Manages user notebooks and saved calculations
- **MongoDB Integration**: Stores user data and calculations

### Frontend (React/TypeScript/Vite)

The frontend is built with React, TypeScript, and Vite, featuring:

- **Interactive Drawing Canvas**: For handwriting mathematical expressions
- **Results Display**: Shows processed expressions and solutions
- **Notebook Panel**: Organizes saved calculations
- **Variable Management**: Tracks variables across calculations
- **Authentication UI**: User login and registration screens

## 🛠️ Technologies Used

### Backend

- **FastAPI**: High-performance web framework for building APIs
- **MongoDB**: NoSQL database for storing user data and calculations
- **Python 3.13**: Core programming language
- **JWT**: For secure authentication
- **Uvicorn**: ASGI server for running the FastAPI application

### Frontend

- **React 18**: UI library
- **TypeScript**: Type-safe JavaScript
- **Vite**: Next-generation frontend tooling
- **Tailwind CSS**: Utility-first CSS framework
- **Mantine Core**: React component library
- **Axios**: HTTP client for API requests
- **Framer Motion**: Animation library
- **MathJax**: Math rendering library for displaying mathematical notation

## 🔧 Getting Started

### Prerequisites

- Node.js (v16+)
- Python 3.10+
- MongoDB

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install Python dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Create a `.env` file in the backend directory with the following variables:

   ```
   ENV=dev
   SERVER_URL=127.0.0.1
   PORT=8900
   MONGODB_URL=mongodb://localhost:27017
   DB_NAME=inkquiry
   SECRET_KEY=your_secret_key
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   ```

4. Start the backend server:

   ```bash
   python main.py
   ```

   Or use the provided batch file (Windows):

   ```bash
   .\restart_server.bat
   ```

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install Node dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the frontend directory:

   ```
   VITE_API_URL=http://localhost:8900
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## 📝 Usage Guide

1. **Register/Login**: Create an account or login to access all features
2. **Drawing Canvas**: Use the pen tool to write mathematical expressions
3. **Calculation**: Click the "Calculate" button to process your expression
4. **Variables**: Assign variables (e.g., x = 5) and use them in later calculations
5. **Notebook**: Save your work to the notebook for future reference
6. **Tools**: Switch between pen and eraser tools using the toolbar

## 🧪 Testing

### Backend Tests

Run the API tests with:

```bash
cd backend
python test_api.py
```

JWT authentication tests:

```bash
python test_jwt.py
```

### Frontend Tests

```bash
cd frontend
npm test
```

## 📋 API Documentation

When the backend server is running, API documentation is available at:

- Swagger UI: `http://localhost:8900/docs`
- ReDoc: `http://localhost:8900/redoc`

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🙏 Acknowledgements

- [FastAPI](https://fastapi.tiangolo.com/) - Backend web framework
- [React](https://reactjs.org/) - Frontend library
- [Vite](https://vitejs.dev/) - Frontend tooling
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [MongoDB](https://www.mongodb.com/) - Database
- [MathJax](https://www.mathjax.org/) - Mathematics rendering
