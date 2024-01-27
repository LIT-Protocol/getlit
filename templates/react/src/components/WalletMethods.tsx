import { Connector, useConnect } from "wagmi";
import { useIsMounted } from "../hooks/useIsMounted";
import { AuthView } from "./SignUpMethods";

interface WalletMethodsProps {
  authWithEthWallet: (connector: Connector) => Promise<void>;
  setView: React.Dispatch<React.SetStateAction<AuthView>>;
}

const WalletMethods = ({ authWithEthWallet, setView }: WalletMethodsProps) => {
  const isMounted = useIsMounted();
  const { connectors } = useConnect();

  if (!isMounted) return null;

  return (
    <>
      <h1>Connect your web3 wallet</h1>
      <p>
        Connect your wallet then sign a message to verify you&apos;re the owner
        of the address.
      </p>
      <div className="buttons-container">
        {connectors.map((connector) => (
          <button
            type="button"
            className="btn btn--outline"
            key={connector.id}
            onClick={() => authWithEthWallet(connector)}
          >
            {connector.name.toLowerCase() === "metamask" && (
              <div className="btn__icon">
                <img src="/metamask.png" alt="MetaMask logo" />
              </div>
            )}
            {connector.name.toLowerCase() === "coinbase wallet" && (
              <div className="btn__icon">
                <img src="/coinbase.png" alt="Coinbase logo" />
              </div>
            )}
            <span className="btn__label">Continue with {connector.name}</span>
          </button>
        ))}
        <button
          type="button"
          onClick={() => setView("default")}
          className="btn btn--link"
        >
          Back
        </button>
      </div>
    </>
  );
};

export default WalletMethods;
