import { useState } from "react";
import Button from "../../ui/Button";
import Form from "../../ui/Form";
import FormRowVertical from "../../ui/FormRowVertical";
import Input from "../../ui/Input";

/* import { useLogin } from "./useLogin"; */

function LoginForm() {
  const [email, setEmail] = useState("mehdibch.dev@gmail.com");
  const [password, setPassword] = useState("admin");
  /*   const { login, isLoading } = useLogin(); */

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    /*  login(
      { email, password },
      {
        // reset all to empty string
        onSettled: () => {
          setEmail("");
          setPassword("");
        },
      } 
    );*/
    console.log("submitted");
    setPassword("");
    setEmail("");
  }

  return (
    <Form onSubmit={handleSubmit}>
      <FormRowVertical
        label="Email address"
        error={"please enter a valid email"}
      >
        <Input
          type="email"
          id="email"
          // This makes this form better for password managers
          autoComplete="username"
          value={email}
          /*  onChange={(e) => setEmail(e.target.value)} */
          disabled={false}
        />
      </FormRowVertical>
      <FormRowVertical label="Password" error={"password is required"}>
        <Input
          type="password"
          id="password"
          autoComplete="current-password"
          value={password}
          /*   onChange={(e) => setPassword(e.target.value)} */
          disabled={false}
        />
      </FormRowVertical>
      <FormRowVertical label="" error={""}>
        <Button size="large" disabled={false}>
          {/*  {!isLoading ? "Login" : <SpinnerMini />} */}
          login
        </Button>
      </FormRowVertical>
    </Form>
  );
}

export default LoginForm;
