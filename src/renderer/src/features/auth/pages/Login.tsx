import FormWrapper from '@renderer/shared/components/form/FormWrapper'
import useBoundStore from '@renderer/shared/stores/boundStore'
import { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import z from 'zod'
import LoginForm from '../components/LoginForm'
import useLogin from '../hooks/useLogin'

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

  const updateUser = useBoundStore((state) => state.updateUser)

  const { mutate, error } = useLogin({ onUpdateUser: updateUser, navigate })


  return (
    <div className="max-w-[300px] mx-auto text-slate-700 text-sm">
      <FormWrapper<ValuesType>
        defaultValues={defaultValues}
        onSubmit={mutate}
        schema={schema}
      >
        <LoginForm errorMessage={error?.message ?? ''} />
      </FormWrapper>
    </div>
  )
}
