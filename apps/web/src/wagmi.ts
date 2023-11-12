import { configureChains, createConfig, sepolia } from "wagmi";
import { localhost, mainnet } from "wagmi/chains";
import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet";
import { InjectedConnector } from "wagmi/connectors/injected";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [
    mainnet,
    // only add Sepolia testnet when NEXT_PUBLIC_ALCHEMY_API_KEY is set
    ...(process.env.NEXT_PUBLIC_ALCHEMY_API_KEY ? [sepolia] : []),
    // only add localhost chain in dev environment
    ...(process.env.NODE_ENV === "development" ? [localhost] : []),
  ],
  process.env.NEXT_PUBLIC_ALCHEMY_API_KEY
    ? [
        // only add alchemy provider when NEXT_PUBLIC_ALCHEMY_API_KEY is set
        alchemyProvider({
          apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
        }),
        publicProvider(),
      ]
    : [publicProvider()],
);

export const config = createConfig({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains }),
    new CoinbaseWalletConnector({
      chains,
      options: {
        appName: "wagmi",
      },
    }),
    new InjectedConnector({
      chains,
      options: {
        name: "Injected",
        shimDisconnect: true,
      },
    }),
  ],
  publicClient,
  webSocketPublicClient,
});
