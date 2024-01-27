import { Link } from "react-router-dom";

interface CreateAccountProp {
  error?: Error;
}

export default function CreateAccount({ error }: CreateAccountProp) {
  return (
    <div className="container">
      <div className="wrapper">
        {error && (
          <div className="alert alert--error">
            <p>{error.message}</p>
          </div>
        )}
        <h1>Need a PKP?</h1>
        <p>
          There doesn&apos;t seem to be a Lit wallet associated with your
          credentials. Create one today.
        </p>
        <Link to="/">
          <div className="buttons-container">
            <button type="button" className="btn btn--primary">
              Sign up
            </button>
          </div>
        </Link>
      </div>
    </div>
  );
}
