import { useState } from "react";
import type { FormEvent } from "react";
import { useMutation } from "@apollo/client/react";
import { useNavigate } from "react-router-dom";

import { LOGIN } from "../graphql/auth";
import type { LoginData, LoginVariables } from "../types/auth";
import { useAuth } from "../hooks/useAuth";

const LoginPage = () => {
  const navigate = useNavigate();

  // Updates global authentication state
  const { login: setAuthSession } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Sends login mutation to GraphQL backend
  const [loginMutation, { loading, error }] = useMutation<
    LoginData,
    LoginVariables
  >(LOGIN);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      // Step 1: Authenticate with backend
      const { data } = await loginMutation({
        variables: {
          input: { email, password },
        },
      });

      if (!data?.login) {
        throw new Error("Login failed");
      }

      // Step 2: Update AuthContext
      setAuthSession(data.login.accessToken, data.login.user);

      // Step 3: Navigate after successful login
      navigate("/events", { replace: true });
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return (
    <div>
      <h1>Login</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p>{error.message}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
