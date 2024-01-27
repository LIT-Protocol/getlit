import { useState } from "react";

import AuthMethods from "./AuthMethods";
import WalletMethods from "./WalletMethods";
import WebAuthn from "./WebAuthn";
import StytchOTP from "./StytchOTP";
import StytchEmailOTP from "./StytchEmailOTP";
import { Link } from "react-router-dom";
import { Connector } from "wagmi";

interface SignUpProps {
  handleGoogleLogin: () => Promise<void>;
  handleDiscordLogin: () => Promise<void>;
  authWithEthWallet: (connector: Connector) => Promise<void>;
  registerWithWebAuthn: () => Promise<void>;
  authWithWebAuthn: () => Promise<void>;
  authWithStytch: (accessToken: string, userId?: string) => Promise<void>;
  error?: Error;
}

export type AuthView = "default" | "email" | "phone" | "wallet" | "webauthn";

export default function SignUpMethods({
  handleGoogleLogin,
  handleDiscordLogin,
  authWithEthWallet,
  registerWithWebAuthn,
  authWithWebAuthn,
  authWithStytch,
  error,
}: SignUpProps) {
  const [view, setView] = useState<AuthView>("default");

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
            <h1>Get started</h1>
            <p>
              Create a wallet that is secured by accounts you already have. With
              Lit-powered MPC wallets, you won&apos;t have to worry about seed
              phrases or browser extensions.
            </p>
            <AuthMethods
              handleGoogleLogin={handleGoogleLogin}
              handleDiscordLogin={handleDiscordLogin}
              setView={setView}
            />
            <Link to="/login">
              <div className="buttons-container">
                <button type="button" className="btn btn--link">
                  Have an account? Log in
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
            start={"register"}
            authWithWebAuthn={authWithWebAuthn}
            setView={setView}
            registerWithWebAuthn={registerWithWebAuthn}
          />
        )}
      </div>
    </div>
  );
}
