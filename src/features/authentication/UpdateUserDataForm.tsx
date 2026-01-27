import React, { useState, useEffect } from "react";

import Button from "../../ui/Button";
import FileInput from "../../ui/FileInput";
import Form from "../../ui/Form";
import FormRow from "../../ui/FormRow";
import Input from "../../ui/Input";
import ButtonGroup from "../../ui/ButtonGroup";

import { useUser } from "./useUser";
import { useUpdateUser } from "./useUpdateUser";

function UpdateUserDataForm() {
  const { user } = useUser();
  const { updateUser, isUpdating } = useUpdateUser();

  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [dateOfBirth, setDateOfBirth] = useState<string>("");
  const [avatar, setAvatar] = useState<File | null>(null);

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || "");
      setLastName(user.last_name || "");
      setPhoneNumber(user.phone_number || "");
      // Format date for input type="date" (YYYY-MM-DD)
      if (user.date_of_birth) {
        setDateOfBirth(user.date_of_birth.split("T")[0]);
      } else {
        setDateOfBirth("");
      }
    }
  }, [user]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!firstName || !lastName) return;

    updateUser(
      {
        firstName,
        lastName,
        phoneNumber,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth).toISOString() : undefined,
        avatar
      },
      {
        onSuccess: () => {
          setAvatar(null);
          // Don't reset text fields, keep them as is (updated state)
        },
      }
    );
  }

  function handleCancel() {
    if (user) {
      setFirstName(user.first_name || "");
      setLastName(user.last_name || "");
      setPhoneNumber(user.phone_number || "");
      if (user.date_of_birth) {
        setDateOfBirth(user.date_of_birth.split("T")[0]);
      } else {
        setDateOfBirth("");
      }
    }
    setAvatar(null);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setAvatar(e.target.files?.[0] ?? null);
  }

  return (
    <Form onSubmit={handleSubmit}>
      <FormRow label="Email address">
        <Input value={user?.email || ""} disabled />
      </FormRow>

      <FormRow label="First name">
        <Input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          disabled={isUpdating}
          id="firstName"
        />
      </FormRow>

      <FormRow label="Last name">
        <Input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          disabled={isUpdating}
          id="lastName"
        />
      </FormRow>

      <FormRow label="Phone Number">
        <Input
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          disabled={isUpdating}
          id="phoneNumber"
        />
      </FormRow>

      <FormRow label="Date of Birth">
        <Input
          type="date"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
          disabled={isUpdating}
          id="dateOfBirth"
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
            type="button"
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
