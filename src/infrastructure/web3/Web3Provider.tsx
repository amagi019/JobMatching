'use client';

import React from 'react';
import {
    RainbowKitProvider,
    getDefaultConfig,
} from '@rainbow-me/rainbowkit';
import { RainbowKitSiweNextAuthProvider } from '@rainbow-me/rainbowkit-siwe-next-auth';
import type { GetSiweMessageOptions } from '@rainbow-me/rainbowkit-siwe-next-auth';
import { WagmiProvider, http } from 'wagmi';
import {
    mainnet,
    polygon,
    base,
    sepolia,
    baseSepolia,
} from 'wagmi/chains';
import {
    QueryClientProvider,
    QueryClient,
} from "@tanstack/react-query";
import { SessionProvider } from 'next-auth/react';
import '@rainbow-me/rainbowkit/styles.css';

const config = getDefaultConfig({
    appName: 'JobMatching Web3',
    projectId: '04309ed1007e77d1f119b85205bb779d',
    chains: [sepolia, baseSepolia, mainnet, polygon, base],
    transports: {
        [sepolia.id]: http(),
        [baseSepolia.id]: http(),
        [mainnet.id]: http(),
        [polygon.id]: http(),
        [base.id]: http(),
    },
    ssr: false,
});

const queryClient = new QueryClient();

const getSiweMessageOptions: GetSiweMessageOptions = () => ({
    statement: 'JobMatching Web3 にサインインします。',
});

export function Web3Provider({ children }: { children: React.ReactNode }) {
    return (
        <WagmiProvider config={config}>
            <SessionProvider refetchInterval={0}>
                <QueryClientProvider client={queryClient}>
                    <RainbowKitSiweNextAuthProvider
                        getSiweMessageOptions={getSiweMessageOptions}
                    >
                        <RainbowKitProvider
                            modalSize="compact"
                            initialChain={sepolia}
                        >
                            {children}
                        </RainbowKitProvider>
                    </RainbowKitSiweNextAuthProvider>
                </QueryClientProvider>
            </SessionProvider>
        </WagmiProvider>
    );
}
