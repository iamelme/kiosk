import FormInput from '@renderer/components/form/FormInput'
import FormWrapper from '@renderer/components/form/FormWrapper'
import { CategoryType } from '@renderer/utils/types'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import z from 'zod'

const schema = z.object({
  name: z.string().min(2)
})

type ValuesType = z.infer<typeof schema>

export default function Detail(): React.JSX.Element {
  const { id } = useParams()

  const [data, setData] = useState<Omit<CategoryType, 'id'>>({ name: '' })

  useEffect(() => {
    const loadData = async (): Promise<void> => {
      if (id && id !== 'new') {
        const res = await window.apiCategory.getCategory(Number(id))

        setData(res)

        console.log('res', res)
      }
    }

    loadData()
  }, [id])

  const handleSubmit = async (data): Promise<void> => {
    console.log('submit', data)

    if (id !== 'new') {
      await window.apiCategory.updateCategory({ id: Number(id), name: data.name })
      return
    }
    await window.apiCategory.createCategory(data.name)
  }

  return (
    <div>
      {id}
      <FormWrapper<ValuesType> defaultValues={data} schema={schema} onSubmit={handleSubmit}>
        <FormInput label="Name" name="name" />
        <input type="submit" value="Save" />
      </FormWrapper>
    </div>
  )
}
