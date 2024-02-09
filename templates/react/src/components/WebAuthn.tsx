import { useState } from "react";
import { AuthView } from "./SignUpMethods";

type WebAuthnStep = "register" | "authenticate";

interface WebAuthnProps {
  start: WebAuthnStep;
  authWithWebAuthn: () => Promise<void>;
  setView: React.Dispatch<React.SetStateAction<AuthView>>;
  registerWithWebAuthn?: () => Promise<void>;
}

export default function WebAuthn({
  start,
  authWithWebAuthn,
  setView,
  registerWithWebAuthn,
}: WebAuthnProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error>();
  const [step, setStep] = useState<WebAuthnStep>(start);

  async function handleRegister() {
    setError(undefined);
    setLoading(true);
    try {
      if (registerWithWebAuthn) await registerWithWebAuthn();
      else setError(new Error("No registerWithWebAuthn function provided"));
      setStep("authenticate");
    } catch (err) {
      if (err instanceof Error) setError(err);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <>
        {error && (
          <div className="alert alert--error">
            <p>{error.message}</p>
          </div>
        )}
        <div className="loader-container">
          <div className="loader" />
          <p>Follow the prompts to continue...</p>
        </div>
      </>
    );
  }

  return (
    <>
      {error && (
        <div className="alert alert--error">
          <p>{error.message}</p>
        </div>
      )}
      {step === "register" && (
        <>
          <h1>Register with an authenticator</h1>
          <p>
            WebAuthn credentials enable simple and secure passwordless
            authentication.
          </p>
          <div className="buttons-container">
            <button
              type="button"
              className={`btn btn--outline ${loading && "btn--loading"}`}
              onClick={handleRegister}
              disabled={loading}
            >
              Create a credential
            </button>
            <button
              type="button"
              onClick={() => setView("default")}
              className="btn btn--link"
            >
              Back
            </button>
          </div>
        </>
      )}
      {step === "authenticate" && (
        <>
          <h1>Authenticate with your authenticator</h1>
          <p>Sign in using your authenticator.</p>
          <div className="buttons-container">
            <button
              type="button"
              className={`btn btn--outline ${loading && "btn--loading"}`}
              onClick={authWithWebAuthn}
              disabled={loading}
            >
              Sign in with authenticator
            </button>
            <button
              type="button"
              onClick={() => setView("default")}
              className="btn btn--link"
            >
              Back
            </button>
          </div>
        </>
      )}
    </>
  );
}
