import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import App from "./App.tsx";
import "./index.css";

// Optional: A simple loading component for the Suspense fallback
const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-black">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-700 border-t-transparent"></div>
  </div>
);

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Failed to find the root element. Check your index.html.");
}

createRoot(rootElement).render(
  <StrictMode>
    <ThemeProvider 
      attribute="class" 
      defaultTheme="light" 
      enableSystem={true}
      disableTransitionOnChange // Prevents weird CSS transitions during theme switch
    >
      <Suspense fallback={<PageLoader />}>
        <App />
      </Suspense>
    </ThemeProvider>
  </StrictMode>
);