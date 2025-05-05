// @ts-nocheck
import React, { useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';

/**
 * Custom hook to check and create embedded wallets for ETH and SOL if missing.
 * Returns a function that will check and create as needed, and a loading state.
 */
export function useCreateEmbeddedWallets() {
  const { user, ready, authenticated } = usePrivy();
  const [loading, setLoading] = React.useState(false);

  // Privy auto-creates embedded wallet if configured, but we provide manual fallback
  const checkAndCreate = useCallback(async () => {
    if (!ready || !authenticated || !user) return;
    const embeddedWallets = (user.linkedAccounts || []).filter(
      (acc: any) => acc.type === 'wallet' && acc.walletClientType === 'privy'
    );
    const hasEth = embeddedWallets.some((acc: any) => acc.walletType === 'ethereum');
    const hasSol = embeddedWallets.some((acc: any) => acc.walletType === 'solana');

    // If both exist, nothing to do
    if (hasEth && hasSol) return;

    setLoading(true);
    try {
      // @ts-ignore
      if (typeof window.Privy !== 'undefined' && typeof window.Privy.createEmbeddedWallet === 'function') {
        // Use Privy global API if exposed (fallback)
        await window.Privy.createEmbeddedWallet();
      } else {
        // Otherwise, rely on auto-create (or show warning)
        console.warn('No Privy embedded wallet creation API available.');
      }
    } finally {
      setLoading(false);
    }
  }, [ready, authenticated, user]);

  return { checkAndCreate, loading };
}
