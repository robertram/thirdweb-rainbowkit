"use client";

import { useEffect } from "react";
import { createThirdwebClient, defineChain, getContract } from "thirdweb";
import { viemAdapter } from "thirdweb/adapters/viem";
import {
	useSetActiveWallet,
	PayEmbed,
	ConnectButton,
	TransactionButton,
	useActiveWallet,
	MediaRenderer,
	useReadContract,
  useActiveAccount,
} from "thirdweb/react";
import { createWalletAdapter } from "thirdweb/wallets";
import { claimTo, getNFT } from "thirdweb/extensions/erc1155";
import {
	useAccount,
	useConnect,
	useDisconnect,
	useSwitchChain,
	useWalletClient,
} from "wagmi";
import { baseSepolia, sepolia } from "thirdweb/chains";
import { ConnectButton as RainbowConnectButton } from '@rainbow-me/rainbowkit';
import { deployERC20Contract } from "thirdweb/deploys";
// import { client } from "../client";

const client = createThirdwebClient({
	clientId: process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID!,
});

const contract = getContract({
	address: "0x638263e3eAa3917a53630e61B1fBa685308024fa",
	chain: baseSepolia,
	client,
});

function App() {
	const wagmiAccount = useAccount();
	const { connectors, connect, status, error } = useConnect();
	const { disconnectAsync } = useDisconnect();
	// This is how to set a wagmi account in the thirdweb context to use with all the thirdweb components including Pay
	const { data: walletClient } = useWalletClient();
	const { switchChainAsync } = useSwitchChain();
	const setActiveWallet = useSetActiveWallet();
	useEffect(() => {
		const setActive = async () => {
			if (walletClient) {
				const adaptedAccount = viemAdapter.walletClient.fromViem({
					walletClient: walletClient as any, // accounts for wagmi/viem version mismatches
				});
        //// defineChain(await walletClient.getChainId()),
				const w = createWalletAdapter({
					adaptedAccount,
					chain: sepolia,
					client,
					onDisconnect: async () => {
						await disconnectAsync();
					},
					switchChain: async (chain) => {
						await switchChainAsync({ chainId: chain.id as any });
					},
				});
				setActiveWallet(w);
			}
		};
		setActive();
	}, [walletClient, disconnectAsync, switchChainAsync, setActiveWallet]);

	// handle disconnecting from wagmi
	const thirdwebWallet = useActiveWallet();
	useEffect(() => {
		const disconnectIfNeeded = async () => {
			if (thirdwebWallet && wagmiAccount.status === "disconnected") {
				await thirdwebWallet.disconnect();
			}
		};
		disconnectIfNeeded();
	}, [wagmiAccount, thirdwebWallet]);

	const { data: nft } = useReadContract(getNFT, {
		contract,
		tokenId: 0n,
	});

  const thirdwebAccount = useActiveAccount();

  const deployContract = async () => {
    const chain = defineChain(1);
    // console.log('account', account);
    // console.log('thirdwebAccount', thirdwebAccount);

    console.log('thirdwebAccount', thirdwebAccount);
    
    // console.log('wagmiAccount', wagmiAccount);

    const contractAddress = await deployERC20Contract({
      chain,
      client,
      account: thirdwebAccount as any,
      type: "TokenERC20",
      params: {
        name: "RobertToken2",
        description: "My Token contract",
        symbol: "RTK2",
      },
    });

    console.log('contractAddress', contractAddress);
  }

	return (
		<div style={{ padding: "0 20px" }}>
			<div>
				<h1>wagmi</h1>
				<h2>Account</h2>

				<div>
					status: {wagmiAccount.status}
					<br />
					addresses: {JSON.stringify(wagmiAccount.addresses)}
					<br />
					chainId: {wagmiAccount.chainId}
				</div>

				{wagmiAccount.status === "connected" && (
					<button
						type="button"
						onClick={async () => {
							await disconnectAsync();
						}}
					>
						Disconnect
					</button>
				)}
			</div>
			<div>
				<h2>Connect</h2>
				{connectors.map((connector) => (
					<button
						key={connector.uid}
						onClick={() => connect({ connector })}
						type="button"
					>
						{connector.name}
					</button>
				))}
				<div>{status}</div>
				<div>{error?.message}</div>
			</div>

      <RainbowConnectButton />

			<hr
				style={{
					borderColor: "#666",
					borderWidth: 1,
					borderStyle: "solid",
					margin: "30px 0",
				}}
			/>

			<h1>thirdweb</h1>

			{wagmiAccount.isConnected ? (
				<div style={{ width: 500 }}>
					<h2>
						<a href="https://portal.thirdweb.com/typescript/v5/react/components/ConnectButton">{`<ConnectButton />`}</a>{" "}
						component
					</h2>
					<ConnectButton client={client} />
					<h2>
						<a href="https://portal.thirdweb.com/connect/pay/get-started#option-2-embed-pay">{`<PayEmbed />`}</a>{" "}
						component
					</h2>
					<PayEmbed client={client} />
					<h2>
						<a href="https://portal.thirdweb.com/typescript/v5/react/components/MediaRenderer">{`<MediaRenderer />`}</a>{" "}
						component
					</h2>
					{nft && <MediaRenderer client={client} src={nft.metadata.image} />}
					<h2>
						<a href="https://portal.thirdweb.com/typescript/v5/react/components/TransactionButton">{`<TransactionButton />`}</a>{" "}
						component
					</h2>
					<TransactionButton
						transaction={() => {
							return claimTo({
								contract,
								quantity: 1n,
								to: wagmiAccount.address!,
								tokenId: 0n,
							});
						}}
						onError={(e) => console.error(e)}
					>
						Mint
					</TransactionButton>
				</div>
			) : (
				<div>
					Connect with wagmi to share the connected wallet between both
					libraries!
				</div>
			)}


      <button onClick={deployContract}>Deploy Contract</button>
			
		</div>
	);
}

export default App;