import FormInput from '../../components/form/FormInput'
import FormWrapper from '../../components/form/FormWrapper'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
import useBoundStore from '../../stores/boundStore'
import { UserType } from '../../utils/types'
import { useMutation } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import z from 'zod'

const schema = z.object({
  user_name: z.string().min(4, { message: 'At least 4 characters' }),
  password: z.string().min(6, { message: 'At least 6 characters' })
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
    await mutation.mutate(data)
  }

  return (
    <div className="max-w-[300px] mx-auto text-slate-700 text-sm">
      <FormWrapper<ValuesType>
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        schema={schema}
      >
        <FormInput autoFocus label="User Name" name="user_name" />
        <FormInput label="Password" name="password" type="password" />
        <p className="mb-3 text-blue-500">
          <Link to="/signup">Register</Link>
        </p>
        {mutation.error && (
          <Alert variant="danger" className="mb-3 test">
            {mutation.error.message}
          </Alert>
        )}
        <Button type="submit" full>
          Login
        </Button>
      </FormWrapper>
    </div>
  )
}
