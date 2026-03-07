import { ReactNode } from "react";
import FormInput from "@renderer/shared/components/form/FormInput";
import Button from "@renderer/shared/components/ui/Button";
import { Link } from "react-router-dom";

export default function SignupForm(): ReactNode {
  return (
    <>
      <FormInput
        variant="default"
        autoFocus
        label="User Name"
        name="user_name"
      />
      <FormInput
        variant="default"
        label="Password"
        name="password"
        type="password"
      />
      <FormInput
        variant="default"
        label="Confirm Password"
        name="confirm_password"
        type="password"
      />
      <p className="mb-3">
        <Link to="/auth" className="text-blue-500">
          Already have an account?
        </Link>
      </p>
      <Button type="submit" full>
        Signup
      </Button>
    </>
  );
}
