import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ApolloProvider } from "@apollo/client/react";
import { apolloClient } from "./apollo/client.ts";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/authContext.tsx";
import "./styles/events.css";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ApolloProvider client={apolloClient}>
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </ApolloProvider>
  </StrictMode>,
);
