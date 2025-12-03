import FormInput from '@renderer/components/form/FormInput'
import FormWrapper from '@renderer/components/form/FormWrapper'
import Alert from '@renderer/components/ui/Alert'
import Button from '@renderer/components/ui/Button'
import { CategoryType } from '@renderer/utils/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import z from 'zod'

const schema = z
  .object({
    id: z.coerce.number().optional(),
    name: z.string().min(2, { message: 'At least two characters' })
  })
  .superRefine(async (data, ctx) => {
    const category = await window.apiCategory.getCategoryByName(data.name)
    console.log({ category })

    if (category.data && category.data?.id !== data.id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Category name is already taken.',
        path: ['name']
      })
    }
  })

type ValuesType = z.infer<typeof schema>

export default function Detail(): React.JSX.Element {
  const { id } = useParams()

  const navigate = useNavigate()

  const { isPending, error, data } = useQuery({
    queryKey: ['category', { id }],
    queryFn: async () => {
      if (Number(id)) {
        return window.apiCategory.getCategoryById(Number(id))
      }

      return {
        name: ''
      }
    }
  })

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (data: CategoryType): Promise<void> => {
      console.log('id', id)

      if (id !== 'new') {
        const { error } = await window.apiCategory.updateCategory({
          id: Number(id),
          name: data.name
        })

        console.log('error update', error)

        if (error && error instanceof Error) {
          throw new Error(error.message)
        }

        navigate(-1)
        return
      }

      const { error } = await window.apiCategory.createCategory(data.name)

      console.log('error', error)

      if (error && error instanceof Error) {
        throw new Error(error.message)
      }

      navigate(-1)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    }
  })
  const handleSubmit = async (data): Promise<void> => {
    console.log('submit', data)

    mutation.mutate(data)
  }

  if (isPending) {
    return <>Loading</>
  }

  if (error) {
    return <>{error.message}</>
  }
  return (
    <div>
      <FormWrapper<ValuesType> defaultValues={data} schema={schema} onSubmit={handleSubmit}>
        <FormInput label="Name" name="name" autoFocus />
        {mutation.error?.message && (
          <Alert variant="danger" className="mt-3">
            {mutation.error?.message}
          </Alert>
        )}
        <Button type="submit">Save</Button>
      </FormWrapper>
    </div>
  )
}
