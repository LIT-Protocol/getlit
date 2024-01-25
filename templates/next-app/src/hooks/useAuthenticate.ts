import { useCallback, useEffect, useState } from "react";
import {
  isSignInRedirect,
  getProviderFromUrl,
} from "@lit-protocol/lit-auth-client";
import { AuthMethod } from "@lit-protocol/types";
import {
  authenticateWithGoogle,
  authenticateWithDiscord,
  authenticateWithEthWallet,
  authenticateWithWebAuthn,
  authenticateWithStytch,
} from "../utils/lit";
import { useAccount, useConnect, useSignMessage } from "wagmi";

export default function useAuthenticate(redirectUri?: string) {
  const [authMethod, setAuthMethod] = useState<AuthMethod>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error>();

  // wagmi hook
  const { connectors, connect, status } = useConnect();
  const account = useAccount();
  const { signMessageAsync } = useSignMessage();

  /**
   * Handle redirect from Google OAuth
   */
  const authWithGoogle = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(undefined);
    setAuthMethod(undefined);

    try {
      const result: AuthMethod = (await authenticateWithGoogle(
        redirectUri as any
      )) as any;
      setAuthMethod(result);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [redirectUri]);

  /**
   * Handle redirect from Discord OAuth
   */
  const authWithDiscord = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(undefined);
    setAuthMethod(undefined);

    try {
      const result: AuthMethod = (await authenticateWithDiscord(
        redirectUri as any
      )) as any;
      setAuthMethod(result);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [redirectUri]);

  /**
   * Authenticate with Ethereum wallet
   */
  const authWithEthWallet = useCallback(
    async (connector: any): Promise<void> => {
      setLoading(true);
      setError(undefined);
      setAuthMethod(undefined);

      try {
        connect({ connector });

        const signMessage = async (message: string) => {
          const sig = await signMessageAsync({ message: message });
          return sig;
        };
        const result = await authenticateWithEthWallet(account.address, signMessage);
        setAuthMethod(result);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    },
    [account.address, connect, signMessageAsync]
  );

  /**
   * Authenticate with WebAuthn credential
   */
  const authWithWebAuthn = useCallback(
    async (username?: string): Promise<void> => {
      setLoading(true);
      setError(undefined);
      setAuthMethod(undefined);

      try {
        const result = await authenticateWithWebAuthn();
        setAuthMethod(result);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Authenticate with Stytch
   */
  const authWithStytch = useCallback(
    async (accessToken: string, userId?: string): Promise<void> => {
      setLoading(true);
      setError(undefined);
      setAuthMethod(undefined);

      try {
        const result: AuthMethod = (await authenticateWithStytch(
          accessToken,
          userId
        )) as any;
        setAuthMethod(result);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    // Check if user is redirected from social login
    if (redirectUri && isSignInRedirect(redirectUri)) {
      // If redirected, authenticate with social provider
      const providerName = getProviderFromUrl();
      if (providerName === "google") {
        authWithGoogle();
      } else if (providerName === "discord") {
        authWithDiscord();
      }
    }
  }, [redirectUri, authWithGoogle, authWithDiscord]);

  return {
    authWithEthWallet,
    authWithWebAuthn,
    authWithStytch,
    authMethod,
    loading,
    error,
  };
}
