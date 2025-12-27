import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './assets/styles.css?assets'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import App from './App'
import { HashRouter, Routes, Route } from 'react-router-dom'

import CategoryPage from './pages/Category'
import CategoryDetail from './pages/Category/Detail'
import ProductPage from './pages/Product'
import ProductDetail from './pages/Product/Detail'
import ProductVerifier from './pages/Product/Verifier'

import InventoryPage from './pages/Inventory'
import InventoryDetail from './pages/Inventory/Detail'
import Login from './pages/Auth/Login'
import ProtectedRoutes from './pages/ProtectedRoutes'
import Signup from './pages/Auth/Signup'
import POS from './pages/POS'

import SalesPage from './pages/Sales'
import SalesDetail from './pages/Sales/Detail'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/"
            element={
              <ProtectedRoutes>
                <App />
              </ProtectedRoutes>
            }
          >
            <Route index element={<>Home Dashboard</>} />
            <Route path="categories">
              <Route index element={<CategoryPage />} />
              <Route path=":id" element={<CategoryDetail />} />
            </Route>

            <Route path="pos" element={<POS />} />
            <Route path="products">
              <Route index element={<ProductPage />} />
              <Route path=":id" element={<ProductDetail />} />
            </Route>

            <Route path="price-verifier" element={<ProductVerifier />} />

            <Route path="inventory">
              <Route index element={<InventoryPage />} />
              <Route path=":id" element={<InventoryDetail />} />
            </Route>

            <Route path="Sales">
              <Route index element={<SalesPage />} />
              <Route path=":id" element={<SalesDetail />} />
            </Route>
          </Route>
        </Routes>
      </HashRouter>
    </QueryClientProvider>
  </StrictMode>
)
