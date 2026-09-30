import { useState } from "react";
import type { FormEvent } from "react";
import { useMutation } from "@apollo/client/react";
import { useNavigate } from "react-router-dom";

import { LOGIN } from "../graphql/auth";
import type { LoginData, LoginVariables } from "../types/auth";
const LoginPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [login, { loading, error }] = useMutation<LoginData, LoginVariables>(
    LOGIN,
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const { data } = await login({
        variables: {
          input: {
            email,
            password,
          },
        },
      });

      const accessToken = data?.login?.accessToken;

      if (!accessToken) {
        return;
      }

      localStorage.setItem("accessToken", accessToken);

      navigate("/events");
    } catch {
      // Error displayed below.
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
          />
        </div>

        <div>
          <label>Password</label>

          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
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
