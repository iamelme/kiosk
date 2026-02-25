import { ReactNode } from 'react'
import FormInput from '../../../shared/components/form/FormInput'
import Button from '../../../shared/components/ui/Button'
import { Link } from 'react-router-dom'


export default function SignupForm(): ReactNode {

  return (
    <>
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

    </>
  )
}
