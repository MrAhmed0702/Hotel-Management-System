import { createRoot } from 'react-dom/client'
import { Provider } from "react-redux"
import { store } from './app/store.js'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './app/App.jsx'

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
)
