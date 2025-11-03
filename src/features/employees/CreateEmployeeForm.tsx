// src/features/employees/CreateEmployeeForm.tsx
import { useForm, SubmitErrorHandler, SubmitHandler } from "react-hook-form";
import Form from "../../ui/Form";
import FormRow from "../../ui/FormRow";
import Input from "../../ui/Input";
import FileInput from "../../ui/FileInput";
import Button from "../../ui/Button";
import { CreateEmployeeFormProps, EmployeeFormValues } from "./EmployeeTypes";
import ButtonGroup from "../../ui/ButtonGroup";

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
            // avatar cannot be pre-filled safely as FileList
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
  const isWorking = false; // until we wire mutations

  const onSubmit: SubmitHandler<EmployeeFormValues> = (data) => {
    const rawAvatar = data.avatar;
    const avatarFileOrUrl =
      typeof rawAvatar === "string" ? rawAvatar : rawAvatar?.[0];

    console.log("SUBMIT EMPLOYEE FORM", {
      ...data,
      avatar: avatarFileOrUrl,
      editId,
    });

    reset();
    onCloseModal?.();
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
