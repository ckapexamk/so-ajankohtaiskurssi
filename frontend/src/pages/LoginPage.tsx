import { useNavigate } from "react-router";
import { useState } from "react";
import { setToken } from "../api/token";
import apiReq from "../api/client";


interface LoginUser {
  email: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
}

const loginRequest = async (data: LoginUser) => {
    return apiReq<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  };

const LoginPage: React.FC = (): React.ReactElement => {
  
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  
  const [disableInput, setDisableInput] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  let redirect = useNavigate();

  const User = async (event: React.SubmitEvent) => {
    event.preventDefault();
    setDisableInput(true);
    setErrorMessage("");

    try {
      const login = await loginRequest({
        email,
        password,
      });

      setToken(login.access_token);
      redirect("/");

    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage("Login failed.");
      }
    } finally {
      setDisableInput(false);
    }
  };

  return (
    <>
      <h2>Login</h2>
        {errorMessage && (
          <div style={{ backgroundColor: "red", color: "white", padding: "1em" }}>
            <strong role="alert">{errorMessage}</strong></div>
        )}
      <form onSubmit={User} style={{ marginTop: "1em" }}>
        <div>
        <label>
          Email:
          <input
            required
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label></div>
        <div>
        <label>
          Password:
          <input
            required
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label></div>
        <button type="submit" disabled={disableInput}>
          {disableInput ? "Please wait..." : "Submit"}
        </button>
      </form>
    </>
  );
};

export default LoginPage;
