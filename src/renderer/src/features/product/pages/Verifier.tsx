import Input from '@renderer/shared/components/ui/Input'
import { useEffect, useRef, useState } from 'react'
import useProductSearch from '../hooks/useProductSearch'
import useDebounce from '@renderer/shared/hooks/useDebounce'

export default function Verifier(): React.ReactElement {
  const searchInputRef = useRef<HTMLInputElement | null>(null)

  const [searchTerm, setSearchTerm] = useState('')

  const { isPending, error, data } = useProductSearch({ searchTerm: useDebounce(searchTerm) })

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef?.current.focus()
    }
    const handleKeyDown = (e): void => {

      if (e.metaKey || e.ctrlKey) {
        if (searchInputRef.current) {
          searchInputRef?.current.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <>
      <Input placeholder="Search" ref={searchInputRef} onChange={e => setSearchTerm(e.target.value)} />
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
