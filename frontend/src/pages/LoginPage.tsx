import { useNavigate } from "react-router";
import { useState } from "react";
import { setToken } from "../auth/token";
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

  const loginUser = async (event: React.SubmitEvent) => {
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
          <strong role="alert">{errorMessage}</strong>
        </div>
      )}
      <form
        onSubmit={loginUser}
        style={{ display: "flex", flexDirection: "column", gap: "0.5em" }}
      >
        <label>
          Email:
          <div>
            <input
              required
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </label>

        <label>
          Password:
          <div>
            <input
              required
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </label>
        <div>
          <button type="submit" disabled={disableInput}>
            {disableInput ? "Please wait..." : "Submit"}
          </button>
        </div>
      </form>
    </>
  );
};

export default LoginPage;
