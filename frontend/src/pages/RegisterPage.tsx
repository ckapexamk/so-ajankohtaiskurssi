import { useNavigate } from "react-router";
import { useState } from "react";
import apiReq from "../api/client";

interface NewUser {
  email: string;
  password: string;
  display_name: string;
}

const RegisterPage: React.FC = (): React.ReactElement => {
  
  const [disableInput, setDisableInput] = useState(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>("");
  
  let redirect = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  
  const registerUserRequest = async (data: NewUser) => {
    return apiReq("/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  };

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
            <strong role="alert">{errorMessage}</strong></div>
        )}
      <form onSubmit={registerUser} style={{ marginTop: "1em" }}>
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
        <div>
        <label>
          Display name:
          <input
            required    
            placeholder="Display name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </label></div>
        <button type="submit" disabled={disableInput}>
          {disableInput ? "Please wait..." : "Submit"}
        </button>
      </form>
    </>
  );
};

export default RegisterPage;
