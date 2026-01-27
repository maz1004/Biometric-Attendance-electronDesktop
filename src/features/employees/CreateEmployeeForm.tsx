import { useForm, SubmitErrorHandler, SubmitHandler } from "react-hook-form";
import styled from "styled-components";
import Form from "../../ui/Form";
import FormRow from "../../ui/FormRow";
import Input from "../../ui/Input";
import FileInput from "../../ui/FileInput";
import Button from "../../ui/Button";
import { CreateEmployeeFormProps, EmployeeFormValues } from "./EmployeeTypes";
import ButtonGroup from "../../ui/ButtonGroup";
import { useCreateEmployee, useUpdateEmployee } from "./useEmployees";
import type { UpdateUserRequest } from "../../services";
import AvatarUploader from "./components/AvatarUploader";
import { useEffect } from "react";

const TopSection = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 4rem;
  margin-bottom: 2rem;
`;

const MainInputs = styled.div`
  display: flex;
  flex-direction: column;
  /* gap: 1rem; */
`;

const AvatarSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 1rem;
  padding-right: 2rem;
`;

function CreateEmployeeForm({
  employeeToEdit,
  onCloseModal,
}: CreateEmployeeFormProps) {
  const editId = employeeToEdit?.id;
  const isEditSession = Boolean(editId);

  const { register, handleSubmit, reset, formState, watch, setValue } =
    useForm<EmployeeFormValues>({
      defaultValues: isEditSession
        ? {
          firstName: employeeToEdit?.firstName ?? "",
          lastName: employeeToEdit?.lastName ?? "",
          email: employeeToEdit?.email ?? "",
          phone: (employeeToEdit as any)?.phoneNumber ?? "",
          department: employeeToEdit?.department ?? "",
          role: employeeToEdit?.role ?? "employee",
          status: employeeToEdit?.status ?? "active",
          password: "", // Password not filled in edit
          dateOfBirth: (employeeToEdit as any)?.dateOfBirth
            ? (employeeToEdit as any).dateOfBirth.split("T")[0]
            : "", // Format YYYY-MM-DD
          avatar: "" as unknown as FileList,
          cv: "" as unknown as FileList,
        }
        : {
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          department: "",
          role: "employee",
          status: "active",
          password: "",
          dateOfBirth: "",
          avatar: "" as unknown as FileList,
          cv: "" as unknown as FileList,
        },
    });

  const { errors } = formState;
  const { createEmployee, isCreating } = useCreateEmployee();
  const { updateEmployee, isUpdating } = useUpdateEmployee();
  const isWorking = isCreating || isUpdating;

  // Watch role to conditionally show/require password
  const watchedRole = watch("role");
  const isManager =
    (watchedRole as string) === "manager" ||
    (watchedRole as string) === "admin" ||
    (watchedRole as string) === "rh";

  // Register avatar manually since we use a custom component
  useEffect(() => {
    register("avatar");
  }, [register]);

  const onAvatarChange = (file: File | null) => {
    // Mimic FileList for consistency with existing types/logic
    // useEmployees expects avatarFile to be a FileList (or array-like with length)
    const fileList = file ? ([file] as unknown as FileList) : ([] as unknown as FileList);
    setValue("avatar", fileList, { shouldValidate: true });
  };

  const onSubmit: SubmitHandler<EmployeeFormValues> = (data) => {
    if (isEditSession) {
      // Map to UpdateUserRequest
      const updateData: UpdateUserRequest = {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        department: data.department,
        is_active: data.status === "active",
        role: data.role as "admin" | "rh" | "employee", // Correctly pass selected role
        // phone_number: data.phone, // TODO: Add to API type if not present
      };

      // If API supports phone update for users, add it (it usually does)
      (updateData as any).phone_number = data.phone;
      (updateData as any).date_of_birth = data.dateOfBirth
        ? new Date(data.dateOfBirth).toISOString()
        : undefined;

      updateEmployee(
        { id: editId!, data: updateData },
        {
          onSuccess: () => {
            reset();
            onCloseModal?.();
          },
        }
      );
    } else {
      // Create Request
      const createData: any = {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone_number: data.phone,
        department: data.department,
        role: data.role, // Pass role!
        password: data.password, // Pass password!
        date_of_birth: data.dateOfBirth
          ? new Date(data.dateOfBirth).toISOString()
          : undefined,
        is_active: data.status === "active",
      };

      // Pass files alongside data
      createEmployee(
        { ...createData, avatarFile: data.avatar, cvFile: data.cv },
        {
          onSuccess: () => {
            reset();
            onCloseModal?.();
          },
        }
      );
    }
  };

  const onError: SubmitErrorHandler<EmployeeFormValues> = (err) => {
    console.error(err);
  };

  return (
    <Form
      onSubmit={handleSubmit(onSubmit, onError)}
      type={onCloseModal ? "modal" : "regular"}
    >
      <TopSection>
        <MainInputs>
          <FormRow label="First name" error={errors?.firstName?.message}>
            <Input
              type="text"
              id="firstName"
              disabled={isWorking}
              {...register("firstName", {
                required: "Required",
              })}
            />
          </FormRow>

          <FormRow label="Last name" error={errors?.lastName?.message}>
            <Input
              type="text"
              id="lastName"
              disabled={isWorking}
              {...register("lastName", {
                required: "Required",
              })}
            />
          </FormRow>

          <FormRow label="Email" error={errors?.email?.message}>
            <Input
              type="email"
              id="email"
              disabled={isWorking}
              placeholder="name@company.com"
              {...register("email", {
                required: "Required",
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: "Invalid email",
                },
              })}
            />
          </FormRow>

          <FormRow label="Phone" error={errors?.phone?.message}>
            <Input
              type="tel"
              id="phone"
              disabled={isWorking}
              placeholder="+123456789"
              {...register("phone")}
            />
          </FormRow>
        </MainInputs>

        <AvatarSection>
          <AvatarUploader
            defaultImage={employeeToEdit?.avatar}
            onImageChanged={onAvatarChange}
            disabled={isWorking}
          />
          {/* Hidden Input purely for error message display if needed, though AvatarUploader handles display */}
          {errors?.avatar?.message && (
            <span style={{ color: 'var(--color-red-700)', fontSize: '1.2rem', marginTop: '0.5rem' }}>
              {errors.avatar.message}
            </span>
          )}
        </AvatarSection>
      </TopSection>

      <FormRow label="Date of Birth" error={errors?.dateOfBirth?.message}>
        <Input
          type="date"
          id="dateOfBirth"
          disabled={isWorking}
          {...register("dateOfBirth")}
        />
      </FormRow>

      <FormRow label="Department" error={errors?.department?.message}>
        <Input
          type="text"
          id="department"
          disabled={isWorking}
          placeholder="Production / QA / HR..."
          {...register("department", {
            required: "Required",
          })}
        />
      </FormRow>

      <FormRow label="Role" error={errors?.role?.message}>
        <select
          id="role"
          disabled={isWorking}
          {...register("role", {
            required: "Required",
          })}
          style={{
            fontSize: "1.4rem",
            padding: "0.8rem 1.2rem",
            borderRadius: "var(--border-radius-sm)",
            border: "1px solid var(--color-grey-300)",
            backgroundColor: "var(--color-grey-0)",
            color: "var(--color-grey-700)",
          }}
        >
          <option value="employee">Employee</option>
          <option value="manager">Manager</option>
        </select>
      </FormRow>

      {!isEditSession && isManager && (
        <FormRow label="Password" error={errors?.password?.message}>
          <Input
            type="password"
            id="password"
            disabled={isWorking}
            placeholder="Min 8 chars"
            {...register("password", {
              required: isManager ? "Password is required for Managers" : false,
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters",
              },
            })}
          />
        </FormRow>
      )}

      <FormRow label="Status" error={errors?.status?.message}>
        <select
          id="status"
          disabled={isWorking}
          {...register("status", {
            required: "Required",
          })}
          style={{
            fontSize: "1.4rem",
            padding: "0.8rem 1.2rem",
            borderRadius: "var(--border-radius-sm)",
            border: "1px solid var(--color-grey-300)",
            backgroundColor: "var(--color-grey-0)",
            color: "var(--color-grey-700)",
          }}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </FormRow>

      <FormRow label="CV (PDF)" error={errors?.cv?.message}>
        <FileInput
          id="cv"
          accept=".pdf,.doc,.docx"
          disabled={isWorking}
          {...register("cv")}
        />
      </FormRow>

      <FormRow label="" error={""}>
        <ButtonGroup>
          {" "}
          <Button
            variation="secondary"
            type="reset"
            onClick={() => onCloseModal?.()}
          >
            Cancel
          </Button>
          <Button disabled={isWorking}>
            {isEditSession ? "Update employee" : "Create employee"}
          </Button>
        </ButtonGroup>
      </FormRow>
    </Form>
  );
}

export default CreateEmployeeForm;
