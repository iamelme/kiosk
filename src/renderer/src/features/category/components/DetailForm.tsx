import { ReactNode } from "react";
import FormInput from "../../../shared/components/form/FormInput";
import Alert from "../../../shared/components/ui/Alert";
import Button from "../../../shared/components/ui/Button";

type Props = {
  errorMessage?: string
}


export default function DetailForm({ errorMessage }: Props): ReactNode {

  return (
    <>
      <FormInput label="Name" name="name" autoFocus />
      {errorMessage && (
        <Alert variant="danger" className="mt-3">
          {errorMessage}
        </Alert>
      )}
      <Button type="submit">Save</Button>

    </>
  )
}
