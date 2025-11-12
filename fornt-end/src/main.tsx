import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Import 2 Provider mới
import { AuthProvider } from './contexts/AuthContext.tsx' // (Tạo ở bước 4.1)
import { CartProvider } from './contexts/CartContext.tsx' // (Tạo ở bước 4.2)
// Import BrowserRouter (vì chúng ta sẽ xóa nó khỏi App.tsx)
import { BrowserRouter } from 'react-router-dom'; 

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* BrowserRouter nên bọc ngoài cùng */}
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)