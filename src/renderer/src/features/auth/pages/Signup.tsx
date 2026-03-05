import { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import z from 'zod'
import SignupForm from '../components/SignupForm'
import FormWrapper from '@renderer/shared/components/form/FormWrapper'
import useSignup from '../hooks/useSignup'

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

  const { mutate } = useSignup({ navigate })

  return (
    <div className="max-w-[300px] mx-auto text-slate-700 text-sm">
      <FormWrapper<ValuesType>
        defaultValues={defaultValues}
        onSubmit={mutate}
        schema={schema}
      >
        <SignupForm />
      </FormWrapper>
    </div>
  )
}
