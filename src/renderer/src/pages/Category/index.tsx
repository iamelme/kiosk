import { CategoryType } from '@renderer/utils/types'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function CategoryPage(): React.JSX.Element {
  const [data, setData] = useState<CategoryType[]>()

  useEffect(() => {
    const loadData = async (): Promise<void> => {
      const res = await window.apiCategory.getAllCategories()

      console.log('res data', res)
      setData(res)
    }

    loadData()
  }, [])

  return (
    <>
      <ul>
        {data?.map((category) => (
          <li key={category.id}>
            <Link to={`/categories/${category.id}`}>{category.name}</Link>
          </li>
        ))}
      </ul>
    </>
  )
}
