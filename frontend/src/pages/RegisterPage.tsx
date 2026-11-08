import { useNavigate } from "react-router";
import { useState } from "react";
import apiReq from "../api/client";

import { Alert, Button, Group, TextInput, Stack, Title } from '@mantine/core';

interface NewUser {
  email: string;
  password: string;
  display_name: string;
}

const registerUserRequest = async (data: NewUser) => {
  return apiReq<NewUser>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

const RegisterPage: React.FC = (): React.ReactElement => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>("");

  const [disableInput, setDisableInput] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  let redirect = useNavigate();

  const registerUser = async (event: React.SubmitEvent) => {
    event.preventDefault();
    setDisableInput(true);
    setErrorMessage("");

    try {
      await registerUserRequest({
        email,
        password,
        display_name: displayName,
      });

      redirect("/login");
    } catch (error) {
      if (error instanceof Error && error.message.includes("400")) {
        setErrorMessage("Email already exists.");
      } else {
        setErrorMessage("Registration failed.");
      }
    } finally {
      setDisableInput(false);
    }
  };

  return (
    <>
    <Stack align="stretch" style={{ maxWidth: 320, margin: "0 auto"}}>
      <Title>Register</Title>
      {errorMessage && (
        <Alert color="red" title="Error" variant="filled">{errorMessage}</Alert>
      )}

      <form
        onSubmit={registerUser}
        style={{ display: "flex", flexDirection: "column", gap: "0.5em" }}
      >

            <TextInput
              label="Email"
              required
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <TextInput
              label="Password"
              required
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <TextInput
              label="Display Name"
              required
              placeholder="Display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />

        <Group mt="md" justify="flex-end">
          <Button type="submit" disabled={disableInput}>
            {disableInput ? "Please wait..." : "Register"}
          </Button>
        </Group>

      </form>
      </Stack>
    </>
  );
};

export default RegisterPage;
