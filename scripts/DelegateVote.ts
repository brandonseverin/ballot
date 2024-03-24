import { createPublicClient, http, createWalletClient, formatEther, toHex, hexToString, isAddress, getAddress } from "viem";
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
    const _delegateeAddress = parameters[1];
    if (!isAddress(_delegateeAddress)) throw new Error("New voter address not provided")
    const delegateeAddress = getAddress(_delegateeAddress)

    // Print address selected
    // Attaching the contract and checking the selected option
    console.log("Contract selected: ");
    const chairpersonAddress = (await publicClient.readContract({
        address: contractAddress,
        abi,
        functionName: "chairperson",
    })) as any[];
    console.log("Are you chairperson", chairpersonAddress);
    console.log("Do you want to delegate your vote to ", delegateeAddress)
    console.log("Confirm? (Y/n)");

    // Write to the blockchain
    const stdin = process.openStdin();
    stdin.addListener("data", async function (d) {
      if (d.toString().trim().toLowerCase() != "n") {
        const hash = await voter.writeContract({
          address: contractAddress,
          abi,
          functionName: "delegate",
          args: [delegateeAddress],
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