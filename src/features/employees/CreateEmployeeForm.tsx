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
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

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

const AccountTypeSelector = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--color-grey-200);
`;

const TypeButton = styled.button<{ $active: boolean }>`
  background-color: ${(props) => (props.$active ? "var(--color-brand-600)" : "var(--color-grey-0)")};
  color: ${(props) => (props.$active ? "var(--color-brand-50)" : "var(--color-grey-600)")};
  border: 1px solid ${(props) => (props.$active ? "var(--color-brand-600)" : "var(--color-grey-300)")};
  border-radius: var(--border-radius-sm);
  padding: 0.8rem 1.6rem;
  font-size: 1.4rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background-color: ${(props) => (props.$active ? "var(--color-brand-700)" : "var(--color-grey-100)")};
  }
`;

function CreateEmployeeForm({
  employeeToEdit,
  onCloseModal,
}: CreateEmployeeFormProps) {
  const editId = employeeToEdit?.id;
  const isEditSession = Boolean(editId);
  const [accountType, setAccountType] = useState<"employee" | "admin">(
    employeeToEdit?.role === "admin" || employeeToEdit?.role === "rh" || employeeToEdit?.role === "manager"
      ? "admin"
      : "employee"
  );

  const { register, handleSubmit, reset, formState, setValue } =
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
          password: "",
          dateOfBirth: (employeeToEdit as any)?.dateOfBirth
            ? (employeeToEdit as any).dateOfBirth.split("T")[0]
            : "",
          avatar: "" as unknown as FileList,
          cv: "" as unknown as FileList,
        }
        : {
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          department: "",
          role: "employee", // Default will be updated by effect
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
  const { t } = useTranslation();

  // Sync role with account type logic
  useEffect(() => {
    if (!isEditSession) {
      if (accountType === "admin") {
        setValue("role", "rh"); // Default to RH for admin view
      } else {
        setValue("role", "employee");
      }
    }
  }, [accountType, setValue, isEditSession]);

  // Register avatar manually since we use a custom component
  useEffect(() => {
    register("avatar");
  }, [register]);

  const onAvatarChange = (file: File | null) => {
    const fileList = file ? ([file] as unknown as FileList) : ([] as unknown as FileList);
    setValue("avatar", fileList, { shouldValidate: true });
  };

  const onSubmit: SubmitHandler<EmployeeFormValues> = (data) => {
    if (isEditSession) {
      const updateData: UpdateUserRequest = {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        department: data.department,
        is_active: data.status === "active",
        role: data.role as "admin" | "rh" | "employee",
      };

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
      const createData: any = {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone_number: data.phone,
        department: data.department,
        role: data.role,
        password: data.password,
        date_of_birth: data.dateOfBirth
          ? new Date(data.dateOfBirth).toISOString()
          : undefined,
        is_active: data.status === "active",
      };

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
      {!isEditSession && (
        <AccountTypeSelector>
          <TypeButton
            type="button"
            $active={accountType === "employee"}
            onClick={() => setAccountType("employee")}
          >
            {t("employees.form.create_employee")}
          </TypeButton>
          <TypeButton
            type="button"
            $active={accountType === "admin"}
            onClick={() => setAccountType("admin")}
          >
            {t("employees.form.create_admin")}
          </TypeButton>
        </AccountTypeSelector>
      )}

      <TopSection>
        <MainInputs>
          <FormRow label={t("employees.form.first_name")} error={errors?.firstName?.message}>
            <Input
              type="text"
              id="firstName"
              disabled={isWorking}
              {...register("firstName", { required: "Required" })}
            />
          </FormRow>

          <FormRow label={t("employees.form.last_name")} error={errors?.lastName?.message}>
            <Input
              type="text"
              id="lastName"
              disabled={isWorking}
              {...register("lastName", { required: "Required" })}
            />
          </FormRow>

          <FormRow label={t("employees.form.email")} error={errors?.email?.message}>
            <Input
              type="email"
              id="email"
              disabled={isWorking}
              placeholder={t("employees.form.placeholders.email")}
              {...register("email", {
                required: "Required",
                pattern: { value: /\S+@\S+\.\S+/, message: "Invalid email" },
              })}
            />
          </FormRow>

          <FormRow label={t("employees.form.phone")} error={errors?.phone?.message}>
            <Input
              type="tel"
              id="phone"
              disabled={isWorking}
              placeholder={t("employees.form.placeholders.phone")}
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
          {errors?.avatar?.message && (
            <span style={{ color: 'var(--color-red-700)', fontSize: '1.2rem', marginTop: '0.5rem' }}>
              {errors.avatar.message}
            </span>
          )}
        </AvatarSection>
      </TopSection>

      <FormRow label={t("employees.form.dob")} error={errors?.dateOfBirth?.message}>
        <Input
          type="date"
          id="dateOfBirth"
          disabled={isWorking}
          {...register("dateOfBirth")}
        />
      </FormRow>

      <FormRow label={t("employees.form.department")} error={errors?.department?.message}>
        <Input
          type="text"
          id="department"
          disabled={isWorking}
          placeholder={t("employees.form.placeholders.department")}
          {...register("department", { required: "Required" })}
        />
      </FormRow>

      {/* Role Selection - Only visible for Admin mode or if editing */}
      {(accountType === "admin" || isEditSession) && (
        <FormRow label={t("employees.form.role")} error={errors?.role?.message}>
          <select
            id="role"
            disabled={isWorking}
            {...register("role", { required: "Required" })}
            style={{
              fontSize: "1.4rem",
              padding: "0.8rem 1.2rem",
              borderRadius: "var(--border-radius-sm)",
              border: "1px solid var(--color-grey-300)",
              backgroundColor: "var(--color-grey-0)",
              color: "var(--color-grey-700)",
            }}
          >
            {accountType === "admin" ? (
              <>
                <option value="rh">{t("employees.role.rh")}</option>
                <option value="admin">{t("employees.role.admin")}</option>
              </>
            ) : (
              <option value="employee">{t("employees.role.employee")}</option>
            )}
          </select>
        </FormRow>
      )}

      {/* Password - Only for Admin mode */}
      {accountType === "admin" && (
        <FormRow label={t("employees.form.password")} error={errors?.password?.message}>
          <Input
            type="password"
            id="password"
            disabled={isWorking}
            placeholder={t("employees.form.placeholders.password")}
            {...register("password", {
              required: "Password is required for Admin/RH",
              minLength: { value: 8, message: "Min 8 characters" },
            })}
          />
        </FormRow>
      )}

      <FormRow label={t("employees.form.status")} error={errors?.status?.message}>
        <select
          id="status"
          disabled={isWorking}
          {...register("status", { required: "Required" })}
          style={{
            fontSize: "1.4rem",
            padding: "0.8rem 1.2rem",
            borderRadius: "var(--border-radius-sm)",
            border: "1px solid var(--color-grey-300)",
            backgroundColor: "var(--color-grey-0)",
            color: "var(--color-grey-700)",
          }}
        >
          <option value="active">{t("employees.status.active")}</option>
          <option value="inactive">{t("employees.status.inactive")}</option>
        </select>
      </FormRow>

      <FormRow label={t("employees.form.cv")} error={errors?.cv?.message}>
        <FileInput
          id="cv"
          accept=".pdf,.doc,.docx"
          disabled={isWorking}
          {...register("cv")}
        />
      </FormRow>

      <FormRow label="" error={""}>
        <ButtonGroup>
          <Button
            variation="secondary"
            type="reset"
            onClick={() => onCloseModal?.()}
          >
            {t("common.cancel")}
          </Button>
          <Button disabled={isWorking}>
            {isEditSession
              ? t("employees.form.update")
              : accountType === "admin"
                ? t("employees.form.create_admin")
                : t("employees.form.create_employee")}
          </Button>
        </ButtonGroup>
      </FormRow>
    </Form>
  );
}

export default CreateEmployeeForm;
