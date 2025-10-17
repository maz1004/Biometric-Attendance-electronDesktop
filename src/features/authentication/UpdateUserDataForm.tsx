import React, { useState } from "react";

import Button from "../../ui/Button";
import FileInput from "../../ui/FileInput";
import Form from "../../ui/Form";
import FormRow from "../../ui/FormRow";
import Input from "../../ui/Input";
import ButtonGroup from "../../ui/ButtonGroup";

// import { useUser } from "./useUser";
// import { useUpdateUser } from "./useUpdateUser";

function UpdateUserDataForm() {
  // We don't need the loading state, and can immediately use the user data,
  // because we know that it has already been loaded at this point.
  // const {
  //   user: {
  //     email,
  //     user_metadata: { fullName: currentFullName },
  //   },
  // } = useUser();

  // const { updateUser, isUpdating } = useUpdateUser();

  // ---- Local stand-ins (since hooks are commented) ----
  const email = "jane.doe@example.com";
  const currentFullName = "Jane Doe";
  const isUpdating = false;
  const updateUser = (
    payload: { fullName: string; avatar: File | null },
    opts?: { onSuccess?: () => void }
  ) => {
    // Simulate async call
    // eslint-disable-next-line no-console
    console.log("Simulated updateUser (profile):", payload);
    setTimeout(() => opts?.onSuccess?.(), 400);
  };
  // -----------------------------------------------------

  const [fullName, setFullName] = useState<string>(currentFullName);
  const [avatar, setAvatar] = useState<File | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!fullName) return;
    updateUser(
      { fullName, avatar },
      {
        onSuccess: () => {
          setAvatar(null);
          (e.target as HTMLFormElement).reset();
        },
      }
    );
  }

  function handleCancel() {
    setFullName(currentFullName);
    setAvatar(null);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setAvatar(e.target.files?.[0] ?? null);
  }

  return (
    <Form onSubmit={handleSubmit}>
      <FormRow label="Email address">
        <Input value={email} disabled />
      </FormRow>

      <FormRow label="Full name">
        <Input
          disabled={isUpdating}
          type="text"
          value={fullName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFullName(e.target.value)
          }
          id="fullName"
        />
      </FormRow>

      <FormRow label="Avatar image">
        <FileInput
          disabled={isUpdating}
          id="avatar"
          accept="image/*"
          onChange={handleFileChange}
        />
      </FormRow>

      <FormRow label="" error="">
        <ButtonGroup>
          <Button
            type="reset"
            variation="secondary"
            disabled={isUpdating}
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button disabled={isUpdating}>Update account</Button>
        </ButtonGroup>
      </FormRow>
    </Form>
  );
}

export default UpdateUserDataForm;
