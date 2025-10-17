import { useForm } from "react-hook-form";
import Button from "../../ui/Button";
import Form from "../../ui/Form";
import FormRow from "../../ui/FormRow";
import Input from "../../ui/Input";
import ButtonGroup from "../../ui/ButtonGroup";

// import { useUpdateUser } from "./useUpdateUser";

type PasswordFormValues = {
  password: string;
  passwordConfirm: string;
};

function UpdatePasswordForm() {
  const { register, handleSubmit, formState, getValues, reset } =
    useForm<PasswordFormValues>();
  const { errors } = formState;

  // const { updateUser, isUpdating } = useUpdateUser();

  // ---- Local stand-ins (since hooks are commented) ----
  const isUpdating = false;
  const updateUser = (
    payload: { password: string },
    opts?: { onSuccess?: () => void }
  ) => {
    // Simulate async call
    // eslint-disable-next-line no-console
    console.log("Simulated updateUser (password):", payload);
    setTimeout(() => opts?.onSuccess?.(), 300);
  };
  // -----------------------------------------------------

  function onSubmit({ password }: PasswordFormValues) {
    updateUser({ password }, { onSuccess: () => reset() });
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <FormRow
        label="Password (min 8 characters)"
        error={errors?.password?.message}
      >
        <Input
          type="password"
          id="password"
          autoComplete="current-password"
          disabled={isUpdating}
          {...register("password", {
            required: "This field is required",
            minLength: {
              value: 8,
              message: "Password needs a minimum of 8 characters",
            },
          })}
        />
      </FormRow>

      <FormRow
        label="Confirm password"
        error={errors?.passwordConfirm?.message}
      >
        <Input
          type="password"
          autoComplete="new-password"
          id="passwordConfirm"
          disabled={isUpdating}
          {...register("passwordConfirm", {
            required: "This field is required",
            validate: (value) =>
              getValues().password === value || "Passwords need to match",
          })}
        />
      </FormRow>

      <FormRow label="" error="">
        <ButtonGroup>
          <Button onClick={() => reset()} type="reset" variation="secondary">
            Cancel
          </Button>
          <Button disabled={isUpdating}>Update password</Button>
        </ButtonGroup>
      </FormRow>
    </Form>
  );
}

export default UpdatePasswordForm;
