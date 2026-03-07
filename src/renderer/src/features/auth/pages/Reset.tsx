import FormInput from "@renderer/shared/components/form/FormInput";
import FormWrapper from "@renderer/shared/components/form/FormWrapper";
import Button from "@renderer/shared/components/ui/Button";
import { ReactNode } from "react";
import z from "zod";
import useReset from "../hooks/useReset";
import { Link } from "react-router-dom";

const schema = z.object({
  email: z.email()
})

type ValuesType = z.infer<typeof schema>

const defaultValues = {
  email: '',
}

export default function Reset(): ReactNode {

  return (
    <div className="max-w-[300px] mx-auto text-slate-700 text-sm">
      <FormWrapper<ValuesType>
        defaultValues={defaultValues} schema={schema} onSubmit={(data) => useReset(data.email)}>
        <FormInput placeholder="Email address" name="email" />
        <p className="mb-3">
          <Link to="/login" className="text-indigo-500">Login</Link>
        </p>
        <Button type="submit">Submit</Button>
      </FormWrapper>
    </div>
  )
}
