import FormDatalist from '@renderer/components/form/FormDatalist'
import FormInput from '@renderer/components/form/FormInput'
import FormWrapper from '@renderer/components/form/FormWrapper'
import Alert from '@renderer/components/ui/Alert'
import Button from '@renderer/components/ui/Button'
import { ProductType } from '@renderer/utils/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import z from 'zod'

const schema = z
  .object({
    id: z.coerce.number().optional(),
    name: z.string().min(2),
    sku: z.string().min(2),
    description: z.string().optional(),
    price: z.coerce.number(),
    code: z.coerce.number(),
    category_id: z.coerce.number()
  })
  .superRefine(async (data, ctx) => {
    console.log({ data }, { ctx })

    const normalizeCode = Number(data?.code)

    if (normalizeCode) {
      const product = await window.apiProduct.getProductByCode(normalizeCode)

      if (product.data && product.data?.id !== data?.id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Code is already taken.',
          path: ['code']
        })
      }
    }

    const productName = await window.apiProduct.getProductByName(data?.name)

    if (productName.data && productName.data?.id !== data?.id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Name is already taken.',
        path: ['name']
      })
    }
    const productSku = await window.apiProduct.getProductBySku(data?.sku)

    if (productSku.data && productSku.data?.id !== data?.id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'SKU is already taken.',
        path: ['sku']
      })
    }
  })

type ValuesType = z.infer<typeof schema>

export default function Detail(): React.JSX.Element {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => window.apiCategory.getAllCategories()
  })

  const { isPending, error, data } = useQuery({
    queryKey: ['product', { id }],
    queryFn: async () => {
      if (Number(id)) {
        return window.apiProduct.getProductById(Number(id))
      }

      return {
        name: '',
        sku: '',
        description: '',
        price: 0,
        quantity: 1,
        code: 0,
        category_id: 0
      }
    }
  })

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (newData: ProductType): Promise<void> => {
      console.log('submit', newData)

      if (id !== 'new') {
        const { error } = await window.apiProduct.updateProduct({
          ...newData,
          id: Number(id)
        })
        if (error) {
          throw new Error(error.message)
        }
        navigate(-1)
        return
      }
      const { error } = await window.apiProduct.createProduct(newData)

      if (error) {
        throw new Error(error.message)
      }

      navigate(-1)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    }
  })

  const handleSubmit = async (data: ProductType): Promise<void> => {
    console.log('submit', data)

    mutation.mutate(data)
  }

  const categoryOptions = categories?.map((cat) => ({ label: cat.name, value: String(cat.id) }))

  if (isPending) {
    return <>Loading</>
  }

  if (error) {
    return <>{error.message}</>
  }

  return (
    <div className="p-4 bg-white border border-slate-200 rounded-md">
      <FormWrapper<ValuesType>
        defaultValues={data}
        schema={schema}
        onSubmit={handleSubmit}
        key={id}
      >
        <FormInput label="Name" name="name" />
        <FormInput label="SKU" name="sku" fieldWatch="name" />
        <FormInput label="Code" name="code" />
        <FormInput label="Description" name="description" />
        <FormInput label="Price" name="price" />
        <FormDatalist
          label="Category"
          name="category_id"
          options={categoryOptions}
          target="categories"
        />
        {mutation.error?.message && (
          <Alert variant="danger" className="mt-3">
            {mutation.error?.message}
          </Alert>
        )}
        <Button type="submit" className="mt-4">
          Save
        </Button>
      </FormWrapper>
    </div>
  )
}
