import styled from "styled-components";
import LoginForm from "../features/authentication/LoginForm";
import SignupForm from "../features/authentication/SignupForm";
import Logo from "../ui/Logo";
import Heading from "../ui/Heading";
import { useState } from "react";

const LoginLayout = styled.main`
  min-height: 100vh;
  display: grid;
  grid-template-columns: 48rem;
  align-content: center;
  justify-content: center;
  gap: 3.2rem;
  background-color: var(--color-grey-50);
`;

const ToggleText = styled.p`
  text-align: center;
  font-size: 1.4rem;
  
  & button {
    background: none;
    border: none;
    color: var(--color-brand-600);
    cursor: pointer;
    font-weight: 500;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

function Login() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <LoginLayout>
      <Logo />
      <Heading as="h4">{isLogin ? "Log in to your account" : "Create a new account"}</Heading>
      {isLogin ? <LoginForm /> : <SignupForm />}
      <ToggleText>
        {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
        <button onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Sign up" : "Log in"}
        </button>
      </ToggleText>
    </LoginLayout>
  );
}

export default Login;
