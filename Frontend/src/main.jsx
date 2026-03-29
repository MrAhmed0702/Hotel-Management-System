import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./app/store.js";
import { RouterProvider } from "react-router-dom";
import "./styles/index.css";
import "./styles/variables.css";
import { router } from "./app/Routes.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <Toaster
        position="top-right"
        toastOptions={{ duration: 2500 }}
      />
      <RouterProvider router={router} />
    </QueryClientProvider>
  </Provider>
);