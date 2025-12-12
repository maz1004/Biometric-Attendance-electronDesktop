import { useForm } from "react-hook-form";
import styled from "styled-components";
import Form from "../../ui/Form";
import FormRow from "../../ui/FormRow";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import { useMutation } from "@tanstack/react-query";
import { updatePassword as apiUpdatePassword } from "../../services/auth";
import toast from "react-hot-toast";

const Box = styled.div`
  background-color: var(--color-bg-elevated);
  padding: 2.4rem;
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-border-card);
`;

const Title = styled.h3`
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--color-text-strong);
  margin-bottom: 1.6rem;
`;

export default function SecuritySettings() {
    const { register, handleSubmit, formState, reset, getValues } = useForm();
    const { errors } = formState;

    const { mutate: updatePassword, isPending } = useMutation({
        mutationFn: ({ oldPassword, newPassword }: any) =>
            apiUpdatePassword(oldPassword, newPassword),
        onSuccess: () => {
            toast.success("Password updated successfully");
            reset();
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to update password");
        },
    });

    function onSubmit({ oldPassword, newPassword }: any) {
        updatePassword({ oldPassword, newPassword });
    }

    return (
        <Box>
            <Title>🔒 Security Settings</Title>
            <Form onSubmit={handleSubmit(onSubmit)}>
                <FormRow label="Current Password" error={errors?.oldPassword?.message as string}>
                    <Input
                        type="password"
                        id="oldPassword"
                        disabled={isPending}
                        {...register("oldPassword", { required: "This field is required" })}
                    />
                </FormRow>

                <FormRow label="New Password" error={errors?.newPassword?.message as string}>
                    <Input
                        type="password"
                        id="newPassword"
                        disabled={isPending}
                        {...register("newPassword", {
                            required: "This field is required",
                            minLength: {
                                value: 8,
                                message: "Password needs a minimum of 8 characters",
                            },
                        })}
                    />
                </FormRow>

                <FormRow label="Confirm Password" error={errors?.confirmPassword?.message as string}>
                    <Input
                        type="password"
                        id="confirmPassword"
                        disabled={isPending}
                        {...register("confirmPassword", {
                            required: "This field is required",
                            validate: (value) =>
                                value === getValues().newPassword || "Passwords need to match",
                        })}
                    />
                </FormRow>

                <FormRow>
                    <Button disabled={isPending} type="submit">
                        {isPending ? "Updating..." : "Update Password"}
                    </Button>
                </FormRow>
            </Form>
        </Box>
    );
}
