import FormInput from '../../components/form/FormInput'
import FormWrapper from '../../components/form/FormWrapper'
import Button from '../../components/ui/Button'
import { UserType } from '../../utils/types'
import { useMutation } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import z from 'zod'

const schema = z.object({
  user_name: z.string().min(4, { message: 'At least 4 characters' }),
  password: z.string().min(6, { message: 'At least 6 characters' }),
  confirm_password: z.string().min(6, { message: 'At least 6 characters' })
})

type ValuesType = z.infer<typeof schema>

const defaultValues = {
  user_name: '',
  password: ''
}

export default function Signup(): ReactNode {
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: async (data: UserType): Promise<void> => {
      await window.apiUser.create(data)
    },
    onSuccess: () => {
      navigate('/login')
    }
  })

  const handleSubmit = async (data): Promise<void> => {
    console.log('submit', data)
    const test = await mutation.mutate(data)
    console.log('test', test)
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
        <FormInput label="Confirm Password" name="confirm_password" type="password" />
        <p className="mb-3">
          <Link to="/login" className="text-blue-500">
            Already have an account?
          </Link>
        </p>
        <Button type="submit" full>
          Signup
        </Button>
      </FormWrapper>
    </div>
  )
}
