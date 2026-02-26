import { ReactNode } from "react";
import FormInput from "../../../shared/components/form/FormInput";
import Button from "../../../shared/components/ui/Button";


export default function SystemForm(): ReactNode {

  return (
    <>
      <FormInput name="tax" label="Tax rate" helperText="Lorem ipsum" required />
      <FormInput type="checkbox" name="is_tax_inclusive" label="Tax Inclusive" helperText="Displayed price of a product already includes all applicable taxes " />
      <Button type="submit">Submit</Button>
    </>
  )
}
