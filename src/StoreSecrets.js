const fs = require("fs");
const path = require("path");
const {
  SecretsManager,
  simulateScript,
  ResponseListener,
  ReturnType,
  decodeResult,
  FulfillmentCode,
} = require("@chainlink/functions-toolkit");
const functionsConsumerAbi = require("../abi/functionsClient.json");
const ethers = require("ethers");
require("@chainlink/env-enc").config();

const makeRequestSepolia = async () => {
  // hardcoded for Ethereum Sepolia
  const routerAddress = "0xb83E47C2bC239B3bf370bc41e1459A34b41238D0";
  const donId = "fun-ethereum-sepolia-1";
  const gatewayUrls = [
    "https://01.functions-gateway.testnet.chain.link/",
    "https://02.functions-gateway.testnet.chain.link/",
  ];
  // Initialize functions settings
  const source = fs
    .readFileSync(path.resolve(__dirname, "DON_script.js"))
    .toString();

  const args = [
    "dheeraj0/hello-world-node:amd64-latest",
    "0xd1a6767FAA0dED1d0aF004e966d3253863db7820",
  ];
  const secrets = { staticUrl: process.env.STATIC_URL };
  const slotIdNumber = 0; // slot ID where to upload the secrets
  const expirationTimeMinutes = 2880; // expiration time in minutes of the secrets
  const gasLimit = 300000;

  // Initialize ethers signer and provider to interact with the contracts onchain
  const staticUrl = process.env.STATIC_URL; // fetch PRIVATE_KEY
  console.log("STATIC_URL: ", staticUrl);
  if (!staticUrl)
    throw new Error(
      "private key not provided - check your environment variables"
    );

  const rpcUrl = process.env.ETHEREUM_SEPOLIA_RPC_URL; // fetch Sepolia RPC URL

  if (!rpcUrl)
    throw new Error(`rpcUrl not provided  - check your environment variables`);

  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const privateKey = process.env.PRIVATE_KEY;

  const wallet = new ethers.Wallet(privateKey);
  const signer = wallet.connect(provider); // create ethers signer for signing transactions

  ///////// START SIMULATION ////////////

  console.log("Start simulation...");

  const response = await simulateScript({
    source: source,
    args: args,
    bytesArgs: [], // bytesArgs - arguments can be encoded off-chain to bytes.
    secrets: secrets,
  });

  console.log("Simulation result", response);
  const errorString = response.errorString;
  if (errorString) {
    console.log(`❌ Error during simulation: `, errorString);
  } else {
    const returnType = ReturnType.string;
    const responseBytesHexstring = response.responseBytesHexstring;
    if (ethers.utils.arrayify(responseBytesHexstring).length > 0) {
      const decodedResponse = decodeResult(
        response.responseBytesHexstring,
        returnType
      );
      console.log(`✅ Decoded response to ${returnType}: `, decodedResponse);
    }
  }

  //////// MAKE REQUEST ////////

  console.log("\nMake request...");

  // First encrypt secrets and upload the encrypted secrets to the DON
  const secretsManager = new SecretsManager({
    signer: signer,
    functionsRouterAddress: routerAddress,
    donId: donId,
  });
  await secretsManager.initialize();

  // Encrypt secrets and upload to DON
  const encryptedSecretsObj = await secretsManager.encryptSecrets(secrets);

  console.log(
    `Upload encrypted secret to gateways ${gatewayUrls}. slotId ${slotIdNumber}. Expiration in minutes: ${expirationTimeMinutes}`
  );
  // Upload secrets
  const uploadResult = await secretsManager.uploadEncryptedSecretsToDON({
    encryptedSecretsHexstring: encryptedSecretsObj.encryptedSecrets,
    gatewayUrls: gatewayUrls,
    slotId: slotIdNumber,
    minutesUntilExpiration: expirationTimeMinutes,
  });

  if (!uploadResult.success)
    throw new Error(`Encrypted secrets not uploaded to ${gatewayUrls}`);

  console.log(
    `\n✅ Secrets uploaded properly to gateways ${gatewayUrls}! Gateways response: `,
    uploadResult
  );

  const donHostedSecretsVersion = parseInt(uploadResult.version); // fetch the reference of the encrypted secrets
  console.log(`donHostedSecretsVersion: `, donHostedSecretsVersion);
};

makeRequestSepolia().catch((e) => {
  console.error(e);
  process.exit(1);
});
