import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Button from "../../ui/Button";
import Form from "../../ui/Form";
import FormRowVertical from "../../ui/FormRowVertical";
import Input from "../../ui/Input";
import { useSignup } from "./useSignup";
import SpinnerMini from "../../ui/SpinnerMini";
import type { RegisterRequest } from "../../services/auth";

// Form values with passwordConfirm
interface SignupFormValues extends Omit<RegisterRequest, 'role'> {
    passwordConfirm: string;
    phone_number?: string;
    date_of_birth?: string;
}

function SignupForm() {
    const { signup, isLoading } = useSignup();
    const navigate = useNavigate();
    const { register, formState, getValues, handleSubmit, reset } = useForm<SignupFormValues>();
    const { errors } = formState;

    function onSubmit({ first_name, last_name, email, password, phone_number, date_of_birth }: SignupFormValues) {
        signup(
            {
                first_name,
                last_name,
                email,
                password,
                phone_number,
                date_of_birth,
                role: 'admin' // Default role for signup
            },
            {
                onSettled: () => reset(),
            }
        );
    }

    function handleCancel() {
        reset();
        navigate("/login");
    }

    return (
        <Form onSubmit={handleSubmit(onSubmit)}>
            <FormRowVertical label="First name" error={errors?.first_name?.message}>
                <Input
                    type="text"
                    id="first_name"
                    disabled={isLoading}
                    {...register("first_name", { required: "This field is required" })}
                />
            </FormRowVertical>

            <FormRowVertical label="Last name" error={errors?.last_name?.message}>
                <Input
                    type="text"
                    id="last_name"
                    disabled={isLoading}
                    {...register("last_name", { required: "This field is required" })}
                />
            </FormRowVertical>

            <FormRowVertical label="Email address" error={errors?.email?.message}>
                <Input
                    type="email"
                    id="email"
                    disabled={isLoading}
                    {...register("email", {
                        required: "This field is required",
                        pattern: {
                            value: /\S+@\S+\.\S+/,
                            message: "Please provide a valid email address",
                        },
                    })}
                />
            </FormRowVertical>

            <FormRowVertical label="Phone Number" error={errors?.phone_number?.message}>
                <Input
                    type="tel"
                    id="phone_number"
                    disabled={isLoading}
                    {...register("phone_number")}
                />
            </FormRowVertical>

            <FormRowVertical label="Date of Birth" error={errors?.date_of_birth?.message}>
                <Input
                    type="date"
                    id="date_of_birth"
                    disabled={isLoading}
                    {...register("date_of_birth")}
                />
            </FormRowVertical>

            <FormRowVertical label="Password (min 8 characters)" error={errors?.password?.message}>
                <Input
                    type="password"
                    id="password"
                    disabled={isLoading}
                    {...register("password", {
                        required: "This field is required",
                        minLength: {
                            value: 8,
                            message: "Password needs a minimum of 8 characters",
                        },
                    })}
                />
            </FormRowVertical>

            <FormRowVertical label="Repeat password" error={errors?.passwordConfirm?.message}>
                <Input
                    type="password"
                    id="passwordConfirm"
                    disabled={isLoading}
                    {...register("passwordConfirm", {
                        required: "This field is required",
                        validate: (value) =>
                            value === getValues().password || "Passwords need to match",
                    })}
                />
            </FormRowVertical>

            <FormRowVertical label="" error={""}>
                <div>
                    <Button variation="secondary" type="button" disabled={isLoading} onClick={handleCancel}>
                        Cancel
                    </Button>
                    <Button disabled={isLoading}>
                        {isLoading ? <SpinnerMini /> : "Create new user"}
                    </Button>
                </div>
            </FormRowVertical>
        </Form>
    );
}

export default SignupForm;
