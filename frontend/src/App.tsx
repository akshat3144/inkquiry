import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";
import { ThemeProvider } from "@/components/ui/theme-provider";

import Home from "@/screens/home";

import "@/index.css";

const paths = [
  {
    path: "/",
    element: <Home />,
  },
];

const BrowserRouter = createBrowserRouter(paths);

const App = () => {
  return (
    <ThemeProvider defaultTheme="light" storageKey="inkquiry-theme">
      <MantineProvider>
        <RouterProvider router={BrowserRouter} />
      </MantineProvider>
    </ThemeProvider>
  );
};

export default App;
