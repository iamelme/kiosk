import { ProductType } from '@renderer/utils/types'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function ProductPage(): React.JSX.Element {
  const [data, setData] = useState<Array<ProductType & { category_name: string }>>()
  useEffect(() => {
    const loadData = async (): Promise<void> => {
      const res = await window.apiProduct.getAllProducts()
      console.log('res', res)
      setData(res)
    }

    loadData()
  }, [])

  return (
    <ul>
      {data?.map((product) => (
        <li key={product.id}>
          <Link to={`/products/${product.id}`}>
            {product.name} {product.price / 100} - {product.category_name}
          </Link>
        </li>
      ))}
    </ul>
  )
}
