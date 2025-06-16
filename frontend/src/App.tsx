import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { AuthProvider, useAuth } from "@/context/AuthContext";

import Home from "@/screens/home";
import Login from "@/screens/login";
import Register from "@/screens/register";

import "@/index.css";

// Protected route wrapper
const ProtectedRoute = ({ element }: { element: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return isAuthenticated ? <>{element}</> : <Navigate to="/login" replace />;
};

// Public route wrapper (accessible only when not authenticated)
const PublicRoute = ({ element }: { element: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return !isAuthenticated ? <>{element}</> : <Navigate to="/" replace />;
};

// Define routes with protection
const router = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoute element={<Home />} />,
  },
  {
    path: "/login",
    element: <PublicRoute element={<Login />} />,
  },
  {
    path: "/register",
    element: <PublicRoute element={<Register />} />,
  },
]);

const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="light" storageKey="inkquiry-theme">
        <MantineProvider>
          <RouterProvider router={router} />
        </MantineProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
