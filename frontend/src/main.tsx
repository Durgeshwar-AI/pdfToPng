import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { HistoryProvider } from './context/HistoryContext.jsx'
import { Toaster } from 'sonner'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <HistoryProvider>
          <Toaster
            position="top-right"
            richColors
            closeButton
            duration={5000}
            toastOptions={{
              style: { fontFamily: 'inherit' },
              classNames: {
                toast: 'text-sm font-medium',
              },
            }}
          />
          <App />
        </HistoryProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)