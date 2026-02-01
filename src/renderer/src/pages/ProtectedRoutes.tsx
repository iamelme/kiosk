import useBoundStore from '@renderer/stores/boundStore'
import { ReactNode, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function ProtectedRoutes({ children }: { children: ReactNode }): ReactNode {
  const user = useBoundStore((state) => state.user)
  const userUpdate = useBoundStore((state) => state.updateUser)

  const navigate = useNavigate()

  console.log('user protected routes', user)

  useEffect(() => {
    if (!user?.id) {
      const auth = localStorage.getItem('auth')
      if (auth) {
        const state = JSON.parse(auth)
        if (state?.state?.user?.id) {
          userUpdate(state.state.user)
          console.log(JSON.parse(auth))
          navigate('/')
        }
      }

      navigate('/login')
    }
  }, [user, navigate, userUpdate])

  return children
}
