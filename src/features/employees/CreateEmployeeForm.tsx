// src/features/employees/CreateEmployeeForm.tsx
import { useForm, SubmitErrorHandler, SubmitHandler } from "react-hook-form";
import Form from "../../ui/Form";
import FormRow from "../../ui/FormRow";
import Input from "../../ui/Input";
import FileInput from "../../ui/FileInput";
import Button from "../../ui/Button";
import { CreateEmployeeFormProps, EmployeeFormValues } from "./EmployeeTypes";
import ButtonGroup from "../../ui/ButtonGroup";
import { useCreateEmployee, useUpdateEmployee } from "./useEmployees";
import type { CreateEmployeeRequest, UpdateUserRequest } from "../../services";

function CreateEmployeeForm({
  employeeToEdit,
  onCloseModal,
}: CreateEmployeeFormProps) {
  const editId = employeeToEdit?.id;
  const isEditSession = Boolean(editId);

  const { register, handleSubmit, reset, formState } =
    useForm<EmployeeFormValues>({
      defaultValues: isEditSession
        ? {
          firstName: employeeToEdit?.firstName ?? "",
          lastName: employeeToEdit?.lastName ?? "",
          department: employeeToEdit?.department ?? "",
          role: employeeToEdit?.role ?? "employee",
          status: employeeToEdit?.status ?? "active",
          avatar: "" as unknown as FileList,
        }
        : {
          firstName: "",
          lastName: "",
          department: "",
          role: "employee",
          status: "active",
          avatar: "" as unknown as FileList,
        },
    });

  const { errors } = formState;
  const { createEmployee, isCreating } = useCreateEmployee();
  const { updateEmployee, isUpdating } = useUpdateEmployee();
  const isWorking = isCreating || isUpdating;

  const onSubmit: SubmitHandler<EmployeeFormValues> = (data) => {
    if (isEditSession) {
      // Map to UpdateUserRequest
      const updateData: UpdateUserRequest = {
        first_name: data.firstName,
        last_name: data.lastName,
        department: data.department,
        is_active: data.status === "active",
        // Note: role 'manager' is not supported by backend, map to 'employee'
        role: data.role === "manager" ? "employee" : "employee",
      };

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
      // Map to CreateEmployeeRequest
      const createData: CreateEmployeeRequest = {
        first_name: data.firstName,
        last_name: data.lastName,
        email: `${data.firstName.toLowerCase()}.${data.lastName.toLowerCase()}@company.com`, // Generate email
        department: data.department,
        is_active: data.status === "active",
      };

      createEmployee(createData, {
        onSuccess: () => {
          reset();
          onCloseModal?.();
        },
      });
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

      <FormRow label="Photo / Face" error={errors?.avatar?.message}>
        <FileInput
          id="avatar"
          accept="image/*"
          disabled={isWorking}
          {...register("avatar", {
            required: isEditSession ? false : "Required",
          })}
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
