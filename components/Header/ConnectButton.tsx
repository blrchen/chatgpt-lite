import React from 'react';
import { useEffect, useState } from "react";
import { useLogin } from "@privy-io/react-auth";
import { getAccessToken, usePrivy, useWallets } from "@privy-io/react-auth";
import { useSolanaWallets } from '@privy-io/react-auth/solana';

export const ConnectButton: React.FC = () => {
  const {
    ready,
    authenticated,
    user,
    logout,
    linkEmail,
    linkWallet,
    unlinkEmail,
    linkPhone,
    unlinkPhone,
    unlinkWallet,
    linkGoogle,
    unlinkGoogle,
    linkTwitter,
    unlinkTwitter,
    linkDiscord,
    unlinkDiscord,
  } = usePrivy();

  const { login } = useLogin({
    onComplete: () => {
      console.log('login success')
    },
  });

  const { wallets, ready: walletsReady } = useWallets();
  const { wallets: solanaWallets } = useSolanaWallets();

  useEffect(() => {
    console.log('ready', ready, 'authenticated', authenticated)
    if (ready && !authenticated) {
      console.log('not authenticated')
    }
    if (ready && authenticated && walletsReady) {
      const embeddedWallets = wallets.filter((w) => w.walletClientType === 'privy');
      if (embeddedWallets.length > 0) {
        console.log('Embedded wallets:', embeddedWallets);
        setEvmEmbedded(embeddedWallets[0]);
      } else {
        console.log('No embedded wallets found');
      }
    }
  }, [ready, authenticated, walletsReady, wallets]);

  // Mirror effect for Solana wallets
  useEffect(() => {
    if (ready && authenticated && solanaWallets) {
      const embeddedSolanaWallets = solanaWallets.filter((w: any) => w.walletClientType === 'privy');
      if (embeddedSolanaWallets.length > 0) {
        console.log('Embedded Solana wallets:', embeddedSolanaWallets);
        setSolEmbedded(embeddedSolanaWallets[0]);
      } else {
        console.log('No embedded Solana wallets found');
      }
    }
  }, [ready, authenticated, solanaWallets]);
  // 直接使用 Privy 官方 ConnectButton 组件，自动处理连接和登录
  // Export EVM embedded wallet private key
  const { exportWallet: exportEvmWallet } = usePrivy();
  // Export Solana embedded wallet private key
  const { exportWallet: exportSolWallet } = useSolanaWallets();

  // State for embedded wallet addresses
  const [evmEmbedded, setEvmEmbedded] = useState<any | null>(null);
  const [solEmbedded, setSolEmbedded] = useState<any | null>(null);

  // 导出 EVM embedded wallet 私钥
  const handleExportEvm = async () => {
    console.log('Export EVM button clicked');
    if (!evmEmbedded) {
      console.log('No EVM embedded wallet found');
      return;
    }
    console.log('EVM embedded wallet address:', evmEmbedded.address);
    try {
      console.log('Invoking exportEvmWallet...');
      const res = await exportEvmWallet({ address: evmEmbedded.address });
      console.log('exportEvmWallet result:', res);
      if (res?.privateKey) {
        console.log('EVM embedded wallet private key:', res.privateKey);
      } else {
        console.log('EVM embedded wallet export result:', res);
      }
    } catch (err) {
      console.error('Failed to export EVM embedded wallet:', err);
    }
  };

  // 导出 Solana embedded wallet 私钥
  const handleExportSol = async () => {
    console.log('Export Solana button clicked');
    if (!solEmbedded) {
      console.log('No Solana embedded wallet found');
      return;
    }
    console.log('Solana embedded wallet address:', solEmbedded.address);
    try {
      console.log('Invoking exportSolWallet...');
      const res = await exportSolWallet({ address: solEmbedded.address });
      console.log('exportSolWallet result:', res);
      if (res?.privateKey) {
        console.log('Solana embedded wallet private key:', res.privateKey);
      } else {
        console.log('Solana embedded wallet export result:', res);
      }
    } catch (err) {
      console.error('Failed to export Solana embedded wallet:', err);
    }
  };


  return (
    <div style={{ marginLeft: 16 }}>
      {ready && authenticated ? (
        <div className="flex flex-col gap-2">
          <div className="flex flex-row justify-between items-center">
            <h1 className="text-2xl font-semibold">Privy Auth Demo</h1>
            <button
              onClick={logout}
              className="text-sm bg-violet-200 hover:text-violet-900 py-2 px-4 rounded-md text-violet-700 ml-4"
            >
              Logout
            </button>
          </div>
          <div className="flex flex-row gap-2 mt-2">
            <button
              onClick={() => handleExportEvm()}
              className="text-sm bg-green-200 hover:bg-green-300 py-2 px-4 rounded-md text-green-700"
              disabled={!evmEmbedded}
            >
              Export EVM Embedded Wallet
            </button>
            <button
              onClick={handleExportSol}
              className="text-sm bg-blue-200 hover:bg-blue-300 py-2 px-4 rounded-md text-blue-700"
              disabled={!solEmbedded}
            >
              Export Solana Embedded Wallet
            </button>
          </div>
        </div>
      ) : (
        <button
          className="header-connect-btn login-btn"
          style={{
            borderRadius: '12px',
            border: '1.5px solid #cfd2da',
            boxShadow: '0 2px 12px 0 rgba(127, 90, 240, 0.13)',
            background: 'white',
            color: '#7f5af0',
            fontWeight: 600,
            fontSize: '1rem',
            padding: '0.5em 1.2em',
            transition: 'box-shadow 0.2s, border-color 0.2s, transform 0.1s',
            cursor: 'pointer',
          }}
          onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 24px 0 rgba(127,90,240,0.18)'}
          onMouseOut={e => e.currentTarget.style.boxShadow = '0 2px 12px 0 rgba(127,90,240,0.13)'}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.96)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          onClick={login}
        >
          Log in
        </button>
      )}
    </div>
  );
};

