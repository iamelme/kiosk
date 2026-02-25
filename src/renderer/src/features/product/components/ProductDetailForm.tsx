import { ReactNode } from "react";
import FormCombobox from '../../../shared/components/form/FormCombobox'
import FormInput from '../../../shared/components/form/FormInput'
import Alert from '../../../shared/components/ui/Alert'
import Button from '../../../shared/components/ui/Button'

type Props = {
  categoryOptions?: { label: string, value: string }[]
  errorMessage?: string
}

export default function ProductDetailForm({ categoryOptions, errorMessage }: Props): ReactNode {

  return (
    <>
      <FormInput type="hidden" label="" name="inventory_id" />
      <FormInput label="Name" name="name" />
      <FormInput label="SKU" name="sku" fieldWatch="name" />
      <FormInput label="Code" name="code" />
      <FormInput label="Description" name="description" />
      <div className="flex gap-x-3">
        <div className="flex-1">
          <FormInput label="Price" name="price" />
        </div>
        <div className="flex-1">
          <FormInput label="Cost" name="cost" />
        </div>
      </div>
      <FormInput label="Quantity" name="quantity" />
      <FormCombobox label="Category" name="category_id" options={categoryOptions ?? []} />
      {errorMessage && (
        <Alert variant="danger" className="mt-3">
          {errorMessage}
        </Alert>
      )}
      <Button type="submit" className="mt-4">
        Save
      </Button>
    </>
  )
}
