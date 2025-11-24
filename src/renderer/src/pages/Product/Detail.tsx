import FormInput from '@renderer/components/form/FormInput'
import FormWrapper from '@renderer/components/form/FormWrapper'
import { ProductType } from '@renderer/utils/types'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import z from 'zod'

const schema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  price: z.coerce.number(),
  quantity: z.coerce.number(),
  code: z.coerce.number(),
  category_id: z.coerce.number()
})

type ValuesType = z.infer<typeof schema>

export default function Detail(): React.JSX.Element {
  const { id } = useParams()

  const [data, setData] = useState<Omit<ProductType, 'id'>>({
    name: '',
    description: '',
    price: 0,
    quantity: 1,
    code: 0,
    category_id: 0
  })

  useEffect(() => {
    const loadData = async (): Promise<void> => {
      if (id && id !== 'new') {
        const res = await window.apiProduct.getProductById(Number(id))

        setData(res)

        console.log('res', res)
      }
    }

    loadData()
  }, [id])

  const handleSubmit = async (data): Promise<void> => {
    console.log('submit', data)

    if (id !== 'new') {
      await window.apiProduct.updateProduct({ id: Number(id), ...data })
      return
    }
    await window.apiProduct.createProduct(data)
  }

  return (
    <div>
      {id}
      <FormWrapper<ValuesType> defaultValues={data} schema={schema} onSubmit={handleSubmit}>
        <FormInput label="Name" name="name" />
        <FormInput label="Description" name="description" />
        <FormInput label="Price" name="price" />
        <FormInput label="Quantity" name="quantity" />
        <FormInput label="Code" name="code" />
        <FormInput label="Category" name="category_id" />
        <input type="submit" value="Save" />
      </FormWrapper>
    </div>
  )
}
