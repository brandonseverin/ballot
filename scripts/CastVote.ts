


import { createPublicClient, http, createWalletClient, formatEther, toHex, hexToString } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import * as dotenv from "dotenv";
import { abi, bytecode } from "../artifacts/contracts/Ballot.sol/Ballot.json";



dotenv.config();

const deployerPrivateKey = process.env.PRIVATE_KEY || "";
const providerApiKey = process.env.ALCHEMY_API_KEY || "";

async function main() {
    const parameters = process.argv.slice(2);
    const publicClient = createPublicClient({
        chain: sepolia,
        transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
      });
      const blockNumber = await publicClient.getBlockNumber();
      console.log("Last block number:", blockNumber);
    
      const account = privateKeyToAccount(`0x${deployerPrivateKey}`);
      const voter = createWalletClient({
        account,
        chain: sepolia,
        transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
      });
      console.log("Deployer address:", voter.account.address);

    // Reveiving parameters
    if (!parameters || parameters.length < 2)
      throw new Error("Parameters not provided");
    const contractAddress = parameters[0] as `0x${string}`;
    if (!contractAddress) throw new Error("Contract address not provided");
    if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress))
      throw new Error("Invalid contract address");
    const proposalIndex = parameters[1];
    if (isNaN(Number(proposalIndex))) throw new Error("Invalid proposal index");

    // Attaching the contract and checking the selected option
    console.log("Proposal selected: ");
    const proposal = (await publicClient.readContract({
      address: contractAddress,
      abi,
      functionName: "proposals",
      args: [BigInt(proposalIndex)],
    })) as any[];
    const name = hexToString(proposal[0], { size: 32 });
    console.log("Voting to proposal", name);
    console.log("Confirm? (Y/n)");

    const stdin = process.openStdin();
    stdin.addListener("data", async function (d) {
      if (d.toString().trim().toLowerCase() != "n") {
        const hash = await voter.writeContract({
          address: contractAddress,
          abi,
          functionName: "vote",
          args: [BigInt(proposalIndex)],
        });
        console.log("Transaction hash:", hash);
        console.log("Waiting for confirmations...");
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        console.log("Transaction confirmed");
      } else {
        console.log("Operation cancelled");
      }
      process.exit();
    });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

