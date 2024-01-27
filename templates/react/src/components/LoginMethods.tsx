import { useState } from "react";

import AuthMethods from "./AuthMethods";
import WalletMethods from "./WalletMethods";
import WebAuthn from "./WebAuthn";
import StytchOTP from "./StytchOTP";
import StytchEmailOTP from "./StytchEmailOTP";
import { Link } from "react-router-dom";
import { Connector } from "wagmi";

interface LoginProps {
  handleGoogleLogin: () => Promise<void>;
  handleDiscordLogin: () => Promise<void>;
  authWithEthWallet: (connector: Connector) => Promise<void>;
  authWithWebAuthn: () => Promise<void>;
  authWithStytch: (accessToken: string, userId?: string) => Promise<void>;
  error?: Error;
}

type AuthView = "default" | "email" | "phone" | "wallet" | "webauthn";

export default function LoginMethods({
  handleGoogleLogin,
  handleDiscordLogin,
  authWithEthWallet,
  authWithWebAuthn,
  authWithStytch,
  error,
}: LoginProps) {
  const [view, setView] = useState<AuthView>("default");
  console.log("LoginMethods view", view);

  return (
    <div className="container">
      <div className="wrapper">
        {error && (
          <div className="alert alert--error">
            <p>{error.message}</p>
          </div>
        )}
        {view === "default" && (
          <>
            <h1>Welcome back</h1>
            <p>Access your Lit wallet.</p>
            <AuthMethods
              handleGoogleLogin={handleGoogleLogin}
              handleDiscordLogin={handleDiscordLogin}
              setView={setView}
            />
            <Link to="/">
              <div className="buttons-container">
                <button type="button" className="btn btn--link">
                  Need an account? Sign up
                </button>
              </div>
            </Link>
          </>
        )}
        {view === "email" && (
          <StytchEmailOTP authWithStytch={authWithStytch} setView={setView} />
        )}
        {view === "phone" && (
          <StytchOTP authWithStytch={authWithStytch} setView={setView} />
        )}
        {view === "wallet" && (
          <WalletMethods
            authWithEthWallet={authWithEthWallet}
            setView={setView}
          />
        )}
        {view === "webauthn" && (
          <WebAuthn
            start={"authenticate"}
            authWithWebAuthn={authWithWebAuthn}
            setView={setView}
          />
        )}
      </div>
    </div>
  );
}
