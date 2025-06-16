# InkQuiry

<div align="center">
  <img src="frontend/public/logo.png" alt="InkQuiry Logo" width="200"/>
  <h3>Transforming handwritten ink into intelligent responses</h3>
</div>

## 📋 Overview

InkQuiry is an interactive web application that allows users to draw anything on a digital canvas and receive intelligent responses. The application leverages AI-powered image recognition to analyze drawings and provide insights, solve problems, identify objects, explain concepts, and much more. Whether you're sketching a physics problem, drawing national flags, creating fictional characters, or illustrating scientific concepts, InkQuiry can interpret your drawings and respond creatively.

### Key Features

- **Interactive Drawing Canvas**: Draw anything with customizable brush sizes and colors
- **Versatile Image Recognition**: Identify objects, characters, flags, diagrams, and more
- **Mathematical Problem Solving**: Draw equations, geometric shapes, or physics scenarios
- **Variable Handling**: Define and manipulate variables in your drawings for dynamic scenarios
- **Authentication System**: Secure user accounts with JWT-based authentication
- **Notebook System**: Save and organize your drawings and responses
- **Responsive UI**: Modern interface built with React, Tailwind CSS, and Mantine

## 🛠️ Technology Stack

### Frontend

- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Mantine UI
- **Routing**: React Router
- **Drawing**: HTML5 Canvas with lazy-brush
- **State Management**: React Context API

### Backend

- **Framework**: FastAPI (Python)
- **Authentication**: JWT with bcrypt
- **Database**: MongoDB
- **Image Processing**: Pillow
- **AI Interpretation**: Google Generative AI (Gemini)
- **API Documentation**: Swagger UI (built into FastAPI)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- MongoDB

### Backend Setup

1. Navigate to the backend directory:

   ```
   cd backend
   ```

2. Install required Python packages:

   ```
   pip install -r requirements.txt
   ```

3. Set up your environment variables:

   - Create a `.env` file in the backend directory with the following variables:
     ```
     MONGO_URI=<your-mongodb-connection-string>
     JWT_SECRET=<your-jwt-secret>
     GOOGLE_AI_API_KEY=<your-gemini-api-key>
     ENV=development
     ```

4. Start the backend server:
   ```
   python main.py
   ```
   Alternatively, on Windows, you can use:
   ```
   .\restart_server.bat
   ```

### Frontend Setup

1. Navigate to the frontend directory:

   ```
   cd frontend
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Configure environment variables:

   - Create a `.env` file in the frontend directory:
     ```
     VITE_API_URL=http://localhost:8000
     ```

4. Start the development server:
   ```
   npm run dev
   ```

## 📐 Project Structure

```
inkquiry/
├── backend/                 # FastAPI backend
│   ├── apps/                # API modules
│   │   ├── auth/            # Authentication routes and utils
│   │   ├── calculator/      # Math processing functionality
│   │   └── notebook/        # Notebook management
│   ├── db/                  # Database connection
│   ├── models/              # Data models
│   ├── main.py              # Application entry point
│   └── requirements.txt     # Python dependencies
└── frontend/               # React frontend
    ├── public/             # Static assets
    ├── src/
    │   ├── components/     # Reusable UI components
    │   │   ├── auth/       # Authentication components
    │   │   └── ui/         # Core UI components
    │   ├── context/        # React context providers
    │   ├── screens/        # Application screens/pages
    │   ├── services/       # API service handlers
    │   └── App.tsx         # Application root component
    └── package.json        # Node.js dependencies
```

## 🔒 Authentication

InkQuiry implements JWT-based authentication with the following features:

- User registration with email validation
- Secure password storage with bcrypt hashing
- JWT token generation and validation
- Protected API routes

## 📝 API Endpoints

### Authentication

- `POST /auth/register`: Create a new user account
- `POST /auth/login`: Authenticate and get access token
- `GET /auth/me`: Get current user information

### Calculator (Image Processing)

- `POST /calculator`: Process any drawn content and return AI-generated responses

### Notebook

- `GET /notebook`: Get user's saved notebooks
- `POST /notebook`: Create a new notebook
- `GET /notebook/{id}`: Get a specific notebook
- `PUT /notebook/{id}`: Update a notebook
- `DELETE /notebook/{id}`: Delete a notebook

## 🎨 Usage Examples

InkQuiry is limited only by your creativity! Here are some examples of what you can do:

### Object Recognition

Draw any object like a car, tree, or Captain America's shield, and InkQuiry will identify it.

### Flag Identification

Sketch a national flag, and InkQuiry will tell you which country it belongs to.

### Math Problems

Write out mathematical equations, and get them solved with step-by-step explanations.

### Physics Scenarios

Draw a scenario (like a car approaching a wall), add variables (distance, velocity), and ask questions about time, force, or collision.

### Character Recognition

Draw characters from movies, comics, or create your own, and see what the AI interprets.

### Diagrams & Flowcharts

Create simple diagrams and get them analyzed or improved.

### Creative Writing Prompts

Sketch a scene and ask the AI to craft a story based on your drawing.

The possibilities are endless - use ink to make any query!

## 💻 Development

### Running Tests

```
# Backend tests
cd backend
python -m pytest
```

### Building for Production

#### Backend

```
cd backend
./build.sh
```

#### Frontend

```
cd frontend
npm run build
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
