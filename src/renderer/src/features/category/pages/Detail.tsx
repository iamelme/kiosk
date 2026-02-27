import FormWrapper from '@renderer/shared/components/form/FormWrapper'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import z from 'zod'
import DetailForm from '../components/DetailForm'
import useSubmit from '../hooks/useSubmit'

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
        console.log(id)

        const { data } = await window.apiCategory.getCategoryById(Number(id))
        console.log('data', data)

        if (data) {
          return data
        }
      }

      return {
        name: ''
      }
    }
  })

  const queryClient = useQueryClient()

  const { mutate, error: mutateError } = useSubmit({
    id,
    onNavigate: navigate,
    onInvalidate: queryClient.invalidateQueries({ queryKey: ['categories'] })
  })
  const handleSubmit = async (data): Promise<void> => {
    console.log('submit', data)

    mutate(data)
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
        <DetailForm errorMessage={mutateError?.message ?? ''} />
      </FormWrapper>
    </div>
  )
}
