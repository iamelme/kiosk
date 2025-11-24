import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './assets/styles.css?assets'

import App from './App'
import { HashRouter, Routes, Route } from 'react-router-dom'

import CategoryPage from './pages/Category'
import CategoryDetail from './pages/Category/Detail'
import ProductPage from './pages/Product'
import ProductDetail from './pages/Product/Detail'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<>Home page</>} />
          <Route path="categories">
            <Route index element={<CategoryPage />} />
            <Route path=":id" element={<CategoryDetail />} />
          </Route>
          <Route path="products">
            <Route index element={<ProductPage />} />
            <Route path=":id" element={<ProductDetail />} />
          </Route>
        </Route>
      </Routes>
    </HashRouter>
  </StrictMode>
)
