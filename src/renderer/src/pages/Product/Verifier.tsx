// import Combobox from '@renderer/components/ui/Combobox'
import Input from '@renderer/components/ui/Input'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'

export default function Verifier(): React.ReactElement {
  const searchInputRef = useRef<HTMLInputElement | null>(null)

  const [searchTerm, setSearchTerm] = useState('')

  const { isPending, error, data } = useQuery({
    queryKey: ['product', { search: searchTerm }],
    queryFn: async (searchTerm) => {
      const value = searchTerm.queryKey[1].search

      if (value) {
        const { data } = await window.apiProduct.searchProduct(String(value))

        return data
      }

      return null
    }
  })

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef?.current.focus()
    }
    const handleKeyDown = (e): void => {
      //   console.log('event', e)

      if (e.metaKey || e.ctrlKey) {
        // console.log('Cmd or Ctrl  + k key pressed!')
        if (searchInputRef.current) {
          searchInputRef?.current.focus()
        }
      }
    }

    // console.log('event')
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const handleSearch = (e): void => {
    const { value } = e.target

    setSearchTerm(value)
  }

  // console.log('data', data)
  return (
    <>
      {/* <Combobox>
        <Combobox.Input placeholder="Search..." autoFocus onChange={handleSearch} />
        <Combobox.List>
          {data?.map((item) => (
            <p key={item.id}>
              {item.name} {item.sku} - {item.price}
            </p>
          ))}
        </Combobox.List>
      </Combobox> */}
      <Input placeholder="Search" ref={searchInputRef} onChange={handleSearch} />
      {isPending && <>Loading</>}
      {error && <>{error.message}</>}
      {data?.map((item) => (
        <p key={item.id}>
          {item.name} {item.sku} - {item.price}
        </p>
      ))}
    </>
  )
}
