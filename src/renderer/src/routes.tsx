import { Router } from '../lib/electron-router-dom'

import { Route } from 'react-router-dom'

import CategoryPage from './pages/Category'

export default function AppRoutes(): React.JSX.Element {
  return (
    <Router
      main={
        <>
          <Route path="/" element={<div>Home Page</div>} />
        </>
      }
      product={<Route path="/" element={<CategoryPage />} />}
    />
  )
}
