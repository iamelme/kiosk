import FormInput from "@renderer/shared/components/form/FormInput";
import FormTextarea from "@renderer/shared/components/form/FormTextarea";
import Alert from "@renderer/shared/components/ui/Alert";
import Button from "@renderer/shared/components/ui/Button";
import { ReactNode } from "react";

type Props = {
  errorMessage?: string;
};

export default function CustomerForm({ errorMessage }: Props): ReactNode {
  return (
    <>
      <FormInput name="name" label="Name" required />
      <FormTextarea name="address" label="Address" required />
      <FormInput name="phone" label="Phone" required />
      {errorMessage && (
        <Alert variant="danger" className="mb-3 test">
          {errorMessage}
        </Alert>
      )}
      <Button type="submit">Submit</Button>
    </>
  );
}
