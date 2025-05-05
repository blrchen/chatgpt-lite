import React, { useState, useEffect } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { useWallets } from '@privy-io/react-auth';
import { useSolanaWallets } from '@privy-io/react-auth';
import { createPortal } from 'react-dom';
import { useTheme } from '../Themes';

interface WalletPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export const WalletPanel: React.FC<WalletPanelProps> = ({ isOpen, onClose }) => {
    const { theme } = useTheme();
    const [selectedWallet, setSelectedWallet] = useState<string>('all');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState<'tokens' | 'transactions'>('tokens');

    // Get embedded wallets
    const { wallets: evmWallets } = useWallets();
    const { wallets: solanaWallets } = useSolanaWallets();

    // Filter for embedded wallets only
    const embeddedEvmWallets = evmWallets?.filter(wallet => wallet.walletClientType === 'privy') || [];
    const embeddedSolanaWallets = solanaWallets?.filter(wallet => wallet.walletClientType === 'privy') || [];

    console.log('[WalletPanel] Embedded EVM Wallets:', embeddedEvmWallets);
    console.log('[WalletPanel] Embedded Solana Wallets:', embeddedSolanaWallets);
    console.log('[WalletPanel] Total Embedded EVM Wallets:', embeddedEvmWallets.length);
    console.log('[WalletPanel] Total Embedded Solana Wallets:', embeddedSolanaWallets.length);

    // Wallet options with embedded wallets
    const walletOptions = [
        { id: 'all', name: 'All Wallets...' },
        ...(embeddedEvmWallets.map(wallet => ({
            id: `evm-${wallet.address}`,
            name: `EVM (${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)})`,
            type: 'evm',
            address: wallet.address
        }))),
        ...(embeddedSolanaWallets.map(wallet => ({
            id: `solana-${wallet.address}`,
            name: `SOL (${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)})`,
            type: 'solana',
            address: wallet.address
        })))
    ];

    console.log('[WalletPanel] Final Wallet Options:', walletOptions);

    // Mock data for tokens - in real app, this would come from blockchain
    const mockTokens = {
        evm: [
            { symbol: 'ETH', balance: '0.5', value: '$1,500', change: '+2.5%' },
            { symbol: 'USDC', balance: '500', value: '$500', change: '0%' },
        ],
        solana: [
            { symbol: 'SOL', balance: '10', value: '$1,000', change: '-1.2%' },
            { symbol: 'USDC', balance: '200', value: '$200', change: '0%' },
        ]
    };

    // Mock data for transactions - in real app, this would come from blockchain
    const mockTransactions = {
        evm: [
            { type: 'send', amount: '0.1 ETH', to: '0x1234...5678', time: '2h ago', status: 'completed' },
            { type: 'swap', amount: '100 USDC → 0.05 ETH', time: '1d ago', status: 'completed' },
        ],
        solana: [
            { type: 'receive', amount: '5 SOL', from: 'F21d...7zp', time: '5h ago', status: 'completed' },
            { type: 'send', amount: '50 USDC', to: 'F21d...7zp', time: '1d ago', status: 'completed' },
        ]
    };

    // Calculate total balance
    const calculateTotalBalance = () => {
        let total = 0;
        if (selectedWallet === 'all') {
            // Sum up all EVM and Solana balances
            mockTokens.evm.forEach(token => {
                total += parseFloat(token.value.replace('$', '').replace(',', ''));
            });
            mockTokens.solana.forEach(token => {
                total += parseFloat(token.value.replace('$', '').replace(',', ''));
            });
        } else if (selectedWallet.startsWith('evm-')) {
            mockTokens.evm.forEach(token => {
                total += parseFloat(token.value.replace('$', '').replace(',', ''));
            });
        } else if (selectedWallet.startsWith('solana-')) {
            mockTokens.solana.forEach(token => {
                total += parseFloat(token.value.replace('$', '').replace(',', ''));
            });
        }
        return total.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    };

    // Get filtered tokens based on selected wallet
    const getFilteredTokens = () => {
        if (selectedWallet === 'all') {
            return [...mockTokens.evm, ...mockTokens.solana];
        } else if (selectedWallet.startsWith('evm-')) {
            return mockTokens.evm;
        } else if (selectedWallet.startsWith('solana-')) {
            return mockTokens.solana;
        }
        return [];
    };

    // Get filtered transactions based on selected wallet
    const getFilteredTransactions = () => {
        if (selectedWallet === 'all') {
            return [...mockTransactions.evm, ...mockTransactions.solana];
        } else if (selectedWallet.startsWith('evm-')) {
            return mockTransactions.evm;
        } else if (selectedWallet.startsWith('solana-')) {
            return mockTransactions.solana;
        }
        return [];
    };

    // Log state changes
    useEffect(() => {
        console.log('[WalletPanel] selectedWallet:', selectedWallet);
    }, [selectedWallet]);
    useEffect(() => {
        console.log('[WalletPanel] activeTab:', activeTab);
    }, [activeTab]);
    useEffect(() => {
        console.log('[WalletPanel] isSettingsOpen:', isSettingsOpen);
    }, [isSettingsOpen]);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Get wallet addresses from embedded wallets
    const evmWallet = embeddedEvmWallets[0];
    const solanaWallet = embeddedSolanaWallets[0];

    console.log('[WalletPanel] Selected EVM Wallet:', evmWallet);
    console.log('[WalletPanel] Selected Solana Wallet:', solanaWallet);

    const handleCopyAddress = (address: string) => {
        console.log('[WalletPanel] handleCopyAddress:', address);
        navigator.clipboard.writeText(address);
    };

    const handleExportWallet = async (type: 'evm' | 'solana') => {
        console.log('[WalletPanel] handleExportWallet:', type);
        // Implementation for wallet export
    };

    const handleFundWallet = (type: 'evm' | 'solana') => {
        console.log('[WalletPanel] handleFundWallet:', type);
        // Implementation for funding wallet
    };

    const handleEnableWallet = (type: 'evm' | 'solana') => {
        console.log('[WalletPanel] handleEnableWallet:', type);
        // Implementation for enabling wallet
    };

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-50">
            <div className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />
            <div className="absolute right-0 h-full">
                <div className="h-full flex flex-col items-start justify-start border-l">
                    <div className={`fixed right-0 top-0 h-full w-96 transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                        <div className="flex flex-col h-full">
                            <div className="border text-card-foreground shadow-sm h-screen border-l border-r-0 border-t-0 border-b-0 z-50 relative bg-white/95 rounded-none overflow-hidden w-96">
                                <div className="p-6 flex items-center gap-2 flex-row justify-between space-y-0 py-4 pb-4 border-b">
                                    <div className="flex items-center gap-2">
                                        <Listbox value={selectedWallet} onChange={(val) => { setSelectedWallet(val); console.log('[WalletPanel] Listbox onChange:', val); }}>
                                            <div className="relative">
                                                <Listbox.Button className="relative w-[200px] h-11 cursor-pointer rounded-md bg-white py-2.5 pl-3 pr-10 text-left shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-primary hover:bg-gray-50 transition-colors">
                                                    <span className="block truncate text-sm">
                                                        {walletOptions.find(option => option.id === selectedWallet)?.name}
                                                    </span>
                                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                                        <ChevronUpDownIcon
                                                            className="h-5 w-5 text-gray-400"
                                                            aria-hidden="true"
                                                        />
                                                    </span>
                                                </Listbox.Button>
                                                <Transition
                                                    as={React.Fragment}
                                                    leave="transition ease-in duration-100"
                                                    leaveFrom="opacity-100"
                                                    leaveTo="opacity-0"
                                                >
                                                    <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                                        {walletOptions.map((option) => (
                                                            <Listbox.Option
                                                                key={option.id}
                                                                className={({ active }) =>
                                                                    `relative cursor-pointer select-none py-2 pl-3 pr-9 ${active ? 'bg-primary/10 text-primary' : 'text-gray-900'
                                                                    }`
                                                                }
                                                                value={option.id}
                                                            >
                                                                {({ selected }) => (
                                                                    <>
                                                                        <span
                                                                            className={`block truncate ${selected ? 'font-medium' : 'font-normal'
                                                                                }`}
                                                                        >
                                                                            {option.name}
                                                                        </span>
                                                                        {selected ? (
                                                                            <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-primary">
                                                                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                                    <path
                                                                                        fillRule="evenodd"
                                                                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                                        clipRule="evenodd"
                                                                                    />
                                                                                </svg>
                                                                            </span>
                                                                        ) : null}
                                                                    </>
                                                                )}
                                                            </Listbox.Option>
                                                        ))}
                                                    </Listbox.Options>
                                                </Transition>
                                            </div>
                                        </Listbox>
                                        <button
                                            onClick={() => { setIsSettingsOpen(!isSettingsOpen); console.log('[WalletPanel] setIsSettingsOpen:', !isSettingsOpen); }}
                                            className={`inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-white hover:bg-gray-50 px-2 py-2 h-11 w-11 rounded-full transform ${isSettingsOpen ? 'scale-110' : 'scale-100'} cursor-pointer`}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings">
                                                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                <div className="p-6 pt-0 space-y-4">
                                    <div className="mt-4">
                                        <div className="flex flex-col text-3xl font-bold">{calculateTotalBalance()}</div>
                                    </div>

                                    <div className="flex w-full">
                                        <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-violet-50 h-10 px-4 py-2 bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 shadow-md hover:shadow-lg cursor-pointer">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles mr-2 h-4 w-4 text-violet-50">
                                                <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                                                <path d="M20 3v4" />
                                                <path d="M22 5h-4" />
                                                <path d="M4 17v2" />
                                                <path d="M5 18H3" />
                                            </svg>
                                            Fund Wallet
                                        </button>
                                    </div>

                                    <div className="mt-4">
                                        <div className="w-full">
                                            <div className="flex items-center justify-center rounded-md bg-gray-100 p-1 text-muted-foreground w-full">
                                                <button
                                                    onClick={() => { setActiveTab('tokens'); console.log('[WalletPanel] setActiveTab: tokens'); }}
                                                    className={`flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all duration-200 ${activeTab === 'tokens'
                                                        ? 'bg-white text-primary shadow-sm'
                                                        : 'text-gray-600 hover:text-gray-900'
                                                        } cursor-pointer`}
                                                >
                                                    Tokens
                                                </button>
                                                <button
                                                    onClick={() => { setActiveTab('transactions'); console.log('[WalletPanel] setActiveTab: transactions'); }}
                                                    className={`flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all duration-200 ${activeTab === 'transactions'
                                                        ? 'bg-white text-primary shadow-sm'
                                                        : 'text-gray-600 hover:text-gray-900'
                                                        } cursor-pointer`}
                                                >
                                                    Transactions
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {activeTab === 'tokens' ? (
                                        <div className="space-y-3">
                                            {getFilteredTokens().map((token, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                            <span className="text-sm font-medium">{token.symbol}</span>
                                                        </div>
                                                        <div>
                                                            <div className="font-medium">{token.balance} {token.symbol}</div>
                                                            <div className="text-sm text-gray-500">{token.value}</div>
                                                        </div>
                                                    </div>
                                                    <div className={`text-sm ${token.change.startsWith('+') ? 'text-green-500' : token.change.startsWith('-') ? 'text-red-500' : 'text-gray-500'}`}>
                                                        {token.change}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {getFilteredTransactions().map((tx, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === 'send' ? 'bg-red-100' :
                                                            tx.type === 'receive' ? 'bg-green-100' :
                                                                'bg-blue-100'
                                                            }`}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-up-right h-4 w-4">
                                                                <path d="M7 7h10v10" />
                                                                <path d="M7 17 17 7" />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <div className="font-medium">{tx.amount}</div>
                                                            <div className="text-sm text-gray-500">{tx.time}</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-sm text-gray-500">{tx.status}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {isSettingsOpen && (
                                    <div className="absolute top-20 right-4 z-50 rounded-md border bg-white p-4 text-popover-foreground shadow-md outline-none w-80 transform transition-all duration-300">
                                        <div className="space-y-4">
                                            <h4 className="font-medium text-sm">Settings</h4>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Theme</span>
                                                <div className="flex items-center gap-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sun h-[1.2rem] w-[1.2rem]">
                                                        <circle cx="12" cy="12" r="4" />
                                                        <path d="M12 2v2" />
                                                        <path d="M12 20v2" />
                                                        <path d="m4.93 4.93 1.41 1.41" />
                                                        <path d="m17.66 17.66 1.41 1.41" />
                                                        <path d="M2 12h2" />
                                                        <path d="M20 12h2" />
                                                        <path d="m6.34 17.66-1.41 1.41" />
                                                        <path d="m19.07 4.93-1.41 1.41" />
                                                    </svg>
                                                    <button className="peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=unchecked]:bg-input data-[state=checked]:bg-primary">
                                                        <span className="pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="border-t my-2" />

                                            <h4 className="font-medium text-sm">AI Wallet Settings</h4>

                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm">EVM Wallet</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {`${evmWallet.address.slice(0, 6)}...${evmWallet.address.slice(-4)}`}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    <button onClick={() => handleCopyAddress(evmWallet.address)} className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-copy h-3 w-3 mr-1">
                                                            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                                                            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                                                        </svg>
                                                        Copy
                                                    </button>
                                                    <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-square-arrow-out-up-right h-3 w-3 mr-1">
                                                            <path d="M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6" />
                                                            <path d="m21 3-9 9" />
                                                            <path d="M15 3h6v6" />
                                                        </svg>
                                                        Explorer
                                                    </button>
                                                    <button onClick={() => handleExportWallet('evm')} className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-md px-3">
                                                        Export
                                                    </button>
                                                    <button onClick={() => handleFundWallet('evm')} className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-md px-3">
                                                        Fund
                                                    </button>
                                                    <button onClick={() => handleEnableWallet('evm')} className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-md px-3">
                                                        Enable
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="space-y-2 mt-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm">Solana Wallet</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {`${solanaWallet.address.slice(0, 6)}...${solanaWallet.address.slice(-6)}`}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    <button onClick={() => handleCopyAddress(solanaWallet.address)} className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-copy h-3 w-3 mr-1">
                                                            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                                                            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                                                        </svg>
                                                        Copy
                                                    </button>
                                                    <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-square-arrow-out-up-right h-3 w-3 mr-1">
                                                            <path d="M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6" />
                                                            <path d="m21 3-9 9" />
                                                            <path d="M15 3h6v6" />
                                                        </svg>
                                                        Explorer
                                                    </button>
                                                    <button onClick={() => handleExportWallet('solana')} className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-md px-3">
                                                        Export
                                                    </button>
                                                    <button onClick={() => handleFundWallet('solana')} className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-md px-3">
                                                        Fund
                                                    </button>
                                                    <button onClick={() => handleEnableWallet('solana')} className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-md px-3">
                                                        Enable
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="mt-4 border-t pt-4">
                                                <button onClick={onClose} className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-9 rounded-md px-3 w-full">
                                                    Log Out
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}; 