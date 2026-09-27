import { useNavigate } from "react-router";
import { useState } from "react";
import apiReq from "../api/client";

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
      <h2>Register</h2>
      {errorMessage && (
        <div style={{ backgroundColor: "red", color: "white", padding: "1em" }}>
          <strong role="alert">{errorMessage}</strong>
        </div>
      )}
      <form
        onSubmit={registerUser}
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
        <label>
          Display name:
          <div>
            <input
              required
              placeholder="Display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
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

export default RegisterPage;
