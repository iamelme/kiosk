import { HashRouter, Route, Routes } from "react-router-dom";
import Login from "../features/auth/pages/Login";
import ProtectedRoutes from "./ProtectedRoutes";
import App from "./App";
import Signup from "../features/auth/pages/Signup";
import HomePage from "../features/home/pages";
import POS from "../features/pos/pages";
import CategoryPage from "../features/category/pages";
import CategoryDetail from "../features/category/pages/Detail"
import ProductPage from "../features/product/pages";
import ProductDetail from "../features/product/pages/Detail"

import ProductVerifier from '../features/product/pages/Verifier'
import InventoryPage from '../features/inventory/pages'
import InventoryDetail from '../features/inventory/pages/Detail'

import SalesPage from '../features/sales/pages'
import SalesDetail from '../features/sales/pages/Detail'

import TopProductsPage from '../features/Reports/pages/Top'

import SettingsPage from '../features/settings/pages'

export default function Router() {

  return (

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
          <Route index element={<HomePage />} />
          <Route path="pos" element={<POS />} />
          <Route path="categories">
            <Route index element={<CategoryPage />} />
            <Route path=":id" element={<CategoryDetail />} />
          </Route>

          <Route path="products">
            <Route index element={<ProductPage />} />
            <Route path=":id" element={<ProductDetail />} />
          </Route>

          <Route path="price-verifier" element={<ProductVerifier />} />

          <Route path="inventory">
            <Route index element={<InventoryPage />} />
            <Route path=":id" element={<InventoryDetail />} />
          </Route>

          <Route path="sales">
            <Route index element={<SalesPage />} />
            <Route path=":id" element={<SalesDetail />} />
          </Route>


          <Route path="reports">
            {/* <Route index element={<SalesPage />} /> */}
            <Route path="sales" element={<TopProductsPage />} />
          </Route>

          <Route path="settings">
            <Route index element={<SettingsPage />} />
          </Route>

        </Route>
      </Routes>
    </HashRouter>
  )
}

