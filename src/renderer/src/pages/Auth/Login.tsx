import FormInput from '@renderer/components/form/FormInput'
import FormWrapper from '@renderer/components/form/FormWrapper'
import Button from '@renderer/components/ui/Button'
import useBoundStore from '@renderer/stores/boundStore'
import { UserType } from '@renderer/utils/types'
import { useMutation } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import z from 'zod'

const schema = z.object({
  user_name: z.string().min(4),
  password: z.string().min(6)
})

type ValuesType = z.infer<typeof schema>

const defaultValues = {
  user_name: '',
  password: ''
}

export default function Login(): ReactNode {
  const navigate = useNavigate()
  //   const queryClient = useQueryClient()
  const updateUser = useBoundStore((state) => state.updateUser)

  const mutation = useMutation({
    mutationFn: async (data: UserType): Promise<void> => {
      const { data: user, error } = await window.apiUser.login(data)
      if (error instanceof Error) {
        throw new Error(error.message)
      }

      if (user) {
        updateUser(user)
      }
    },
    onSuccess: () => {
      navigate('/')
    }
  })

  const handleSubmit = async (data): Promise<void> => {
    console.log('submit', data)
    const test = await mutation.mutate(data)
    console.log('test', test)
  }
  return (
    <div className="max-w-[300px] mx-auto">
      <FormWrapper<ValuesType>
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        schema={schema}
      >
        <FormInput autoFocus label="User Name" name="user_name" />
        <FormInput label="Password" name="password" type="password" />
        <p>
          <Link to="/signup">Register</Link>
        </p>
        <Button type="submit">Login</Button>
      </FormWrapper>
    </div>
  )
}
