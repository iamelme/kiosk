import FormCombobox from '../../components/form/FormCombobox'
// import FormDatalist from '../../components/form/FormDatalist'
import FormInput from '../../components/form/FormInput'
import FormWrapper from '../../components/form/FormWrapper'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
// import Combobox from '../../components/ui/Combobox'
import { ProductType } from '../../utils/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import z from 'zod'
import useBoundStore from '../../stores/boundStore'

const schema = z
  .object({
    id: z.coerce.number().optional(),
    name: z.string().min(2),
    sku: z.string().min(2),
    description: z.string().optional(),
    price: z.coerce.number(),
    cost: z.coerce.number(),
    code: z.coerce.number(),
    quantity: z.coerce.number(),
    category_id: z.coerce.number(),
    inventory_id: z.coerce.number()
  })
  .superRefine(async (data, ctx) => {
    console.log({ data }, { ctx })

    const normalizeCode = Number(data?.code)

    if (data.category_id === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'There must be a category.',
        path: ['category_id']
      })
    }

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

  const user = useBoundStore(state => state.user)

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await window.apiCategory.getAllCategories()
      return data
    }
  })

  const { isPending, error, data } = useQuery({
    queryKey: ['product', { id }],
    queryFn: async () => {
      if (Number(id)) {
        const { data } = await window.apiProduct.getProductById(Number(id))

        console.log('data', data)

        return {
          ...data,
          price: data?.price / 100,
          cost: data?.cost / 100
        }
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

      if (!user?.id) return;

      if (id !== 'new') {
        const { error } = await window.apiProduct.updateProduct({
          ...newData,
          id: Number(id),
          user_id: user?.id
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

  const handleSubmit = async (data: ProductType & { quantity: number }): Promise<void> => {
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
        {/* <FormDatalist
          label="Category"
          name="category_id"
          options={categoryOptions}
          target="categories"
        /> */}
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
