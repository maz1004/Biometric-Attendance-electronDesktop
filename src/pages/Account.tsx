import UpdatePasswordForm from "../features/authentication/UpdatePasswordForm";
import UpdateUserDataForm from "../features/authentication/UpdateUserDataForm";
import Heading from "../ui/Heading";
import Row from "../ui/Row";

function Account() {
  return (
    <>
      <Heading as="h1">Update your account</Heading>

      <Row>
        <Heading as="h3">Personal info</Heading>
        <UpdateUserDataForm />
      </Row>

      <Row>
        <Heading as="h3">Change password</Heading>
        <UpdatePasswordForm />
      </Row>
    </>
  );
}

export default Account;
