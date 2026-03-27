import { createRoot } from 'react-dom/client'
import { Provider } from "react-redux"
import { store } from './app/store.js'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import { router } from "./app/routes.jsx"
import { QueryClient, QueryClientProvider} from "@tanstack/react-query"

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </Provider>
)
