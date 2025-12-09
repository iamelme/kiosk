import useBoundStore from '@renderer/stores/boundStore'
import { ReactNode, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function ProtectedRoutes({ children }: { children: ReactNode }): ReactNode {
  const user = useBoundStore((state) => state.user)

  const navigate = useNavigate()

  console.log('user protected routes', user)

  useEffect(() => {
    if (!user.id) {
      navigate('/login')
    }
  }, [user, navigate])

  return children
}
