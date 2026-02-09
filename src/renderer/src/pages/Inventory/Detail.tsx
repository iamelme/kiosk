import FormInput from '../../components/form/FormInput'
import FormWrapper from '../../components/form/FormWrapper'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
import { ProdInventoryType } from '../../interfaces/IInventoryRepository'
import useBoundStore from '../../stores/boundStore'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import z from 'zod'

const schema = z.object({
  id: z.coerce.number().optional(),
  product_id: z.coerce.number(),
  quantity: z.coerce.number()
})

type ValuesType = z.infer<typeof schema>

export default function Detail(): ReactNode {
  const { id } = useParams()

  const navigate = useNavigate()

  const user = useBoundStore((state) => state.user)

  const { isPending, error, data } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const { data } = await window.apiInventory.getInventoryById(Number(id))
      if (!data) {
        return {
          id: Number(id),
          quantity: 0,
          product_name: ''
        }
      }
      return data
    }
  })

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (formData: ProdInventoryType) => {
      if (!user?.id) return
      if (data?.quantity === formData.quantity) {
        navigate(-1)
        return
      }
      const { error } = await window.apiInventory.updateInventory({
        ...formData,
        user_id: user.id,
        movement_type: 2
      })
      if (error instanceof Error) {
        throw new Error(error.message)
      }
      navigate(-1)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-products'] })
    }
  })

  if (isPending) {
    return <>Loading...</>
  }

  if (error) {
    return <>{error.message}</>
  }

  console.log({ data })

  const handleSubmit = (data): void => {
    console.log('submit', data)
    mutation.mutate(data)
  }

  return (
    <>
      <h2 className="text-xl mb-4">{data?.product_name}</h2>
      <FormWrapper<ValuesType> defaultValues={data} schema={schema} onSubmit={handleSubmit}>
        <FormInput label="Quantity" name="quantity" />
        {mutation.error && <Alert variant="danger">{mutation.error.message}</Alert>}
        <Button type="submit">Save</Button>
      </FormWrapper>
    </>
  )
}
