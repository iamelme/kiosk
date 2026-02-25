import { ReactNode } from "react";
import FormInput from '../../../shared/components/form/FormInput'

import Alert from '../../../shared/components/ui/Alert'
import Button from '../../../shared/components/ui/Button'
import { Link } from "react-router-dom";

type Props = {
  errorMessage?: string
}


export default function LoginForm({ errorMessage }: Props): ReactNode {

  return (
    <>
      <FormInput autoFocus label="User Name" name="user_name" />
      <FormInput label="Password" name="password" type="password" />
      <p className="mb-3 text-blue-500">
        <Link to="/signup">Register</Link>
      </p>
      {errorMessage && (
        <Alert variant="danger" className="mb-3 test">
          {errorMessage}
        </Alert>
      )}
      <Button type="submit" full>
        Login
      </Button>
    </>
  )
}
