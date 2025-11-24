import { Link } from 'react-router-dom'

export default function Sidebar(): React.JSX.Element {
  return (
    <aside>
      <ul className="flex flex-col space-x-4">
        <Link to="/">Home</Link>
        <Link to="/categories">Category</Link>
        <Link to="/categories/new">Category New</Link>
        <Link to="/products">Product</Link>
        <Link to="/products/new">Product New</Link>
      </ul>
    </aside>
  )
}
