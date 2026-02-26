import { ReactNode } from "react";
import FormWrapper from "../../../shared/components/form/FormWrapper";
import SystemForm from "../components/SystemForm";
import z from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { SettingsType } from "../utils/type";
import { useNavigate } from "react-router-dom";
import Alert from "../../../shared/components/ui/Alert";

const schema = z.object({
  tax: z.coerce.number(),
  is_tax_inclusive: z.coerce.number().default(1)
})

type ValuesType = z.infer<typeof schema>

export default function System(): ReactNode {
  const navigate = useNavigate()

  const { data, isPending, error } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {

      const { data, error } = await window.apiSettings.getSettings()

      if (error instanceof Error) {
        throw new Error(error.message)
      }

      return data
    }

  })

  const mutation = useMutation({
    mutationFn: async (data: Partial<SettingsType>) => {
      const { error } = await window.apiSettings.update(data)

      console.log(error)

    },
    onSuccess: () => {
      navigate(-1)
      // queryClient.invalidateQueries({ queryKey: ['settings'] })
    }
  })

  if (isPending) {
    return <>Loading...</>
  }


  if (error || !data) {
    return <Alert variant="danger">{error?.message || "Something wen't wrong"}</Alert>
  }


  return (
    <>
      <FormWrapper<ValuesType>
        defaultValues={data}
        schema={schema}
        onSubmit={mutation.mutate}   >
        <SystemForm />
      </FormWrapper >
    </>
  )
}
