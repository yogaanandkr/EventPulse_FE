import { FormEvent, useState } from "react";
import { useMutation } from "@apollo/client/react";
import { useNavigate } from "react-router-dom";

import { REGISTER } from "../graphql/auth";

const RegisterPage = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [register, { loading, error }] = useMutation(REGISTER);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      await register({
        variables: {
          input: {
            name,
            email,
            password,
            role: "CUSTOMER",
          },
        },
      });

      navigate("/login");
    } catch {
      // Apollo exposes the error through `error`.
    }
  };

  return (
    <div>
      <h1>Create Account</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Name</label>

          <input value={name} onChange={e => setName(e.target.value)} />
        </div>

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
          {loading ? "Creating..." : "Register"}
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;
