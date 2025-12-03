import Input from '@renderer/components/ui/Input'
// import { ProductType } from '@renderer/utils/types'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'

export default function Verifier(): React.ReactElement {
  const searchInputRef = useRef<HTMLInputElement | null>(null)

  const [searchTerm, setSearchTerm] = useState('')

  const { isPending, error, data } = useQuery({
    queryKey: ['product', { search: searchTerm }],
    queryFn: async (searchTerm) => {
      console.log('searchTerm', searchTerm)
      const value = searchTerm.queryKey[1].search
      if (value) {
        const normalizeCode = Number(value)
        console.log(normalizeCode)
        if (normalizeCode) {
          const { data } = await window.apiProduct.getProductByCode(normalizeCode)

          return data
        }
      }

      return null
    }
  })

  console.log('searchTerm outside query', searchTerm)

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef?.current.focus()
    }
    const handleKeyDown = (e): void => {
      //   console.log('event', e)

      if (e.metaKey || e.ctrlKey) {
        console.log('Cmd or Ctrl  + k key pressed!')
        if (searchInputRef.current) {
          searchInputRef?.current.focus()
        }
      }
    }

    console.log('event')
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const handleSearch = (e): void => {
    const { value } = e.target

    setSearchTerm(value)
  }

  console.log('data', data)
  return (
    <>
      <Input placeholder="Search" ref={searchInputRef} onChange={handleSearch} />
      {isPending && <>Loading</>}
      {error && <>{error.message}</>}
      <p>
        {data?.name} {data?.sku} - {data?.price}
      </p>
      <p>
        <strong>{data?.code}</strong>
      </p>
    </>
  )
}
