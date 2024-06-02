if (!secrets.staticUrl) {
  throw Error(
    "DECRYPT_KEY environment variable not set. Set the static url in the secrets."
  );
}
async function downloadFromIPFS() {
  const ipfsResponse = await Functions.makeHttpRequest({
    url: "https://experience-having-dream.quicknode-ipfs.com/ipfs/QmXatx6QSPeffjGdZyngiNFLgvyL5vNR3nuN9pfFxzLPV8/0",
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (ipfsResponse.error) {
    throw new Error("Error downloading file from IPFS");
  }
  return ipfsResponse.data;
}
async function decryptData(encryptedData) {
  const static_url = `http://${secrets.staticUrl}:3000/decrypt`;
  console.log(`static_url:   `, static_url);
  const response = await Functions.makeHttpRequest({
    url: static_url, //fixedIP
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    data: { data: encryptedData, key: args[1] },
  });
  console.log(`response:   `, response);
  if (response.error) {
    throw new Error("Error decrypting data");
  }
  const decryptedData = JSON.parse(JSON.stringify(response.data));
  return decryptedData;
}
async function initiateCompute(imageSrc, ipAddress) {
  const urld = `http://${ipAddress}:3001/deploy`;
  console.log(`urld:    `, urld);
  const response = await Functions.makeHttpRequest({
    url: urld,
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    data: { src: imageSrc },
  });
  if (response.error) {
    throw new Error("Error decrypting data");
  }
  return response.data;
}
const encryptedJson = await downloadFromIPFS();
const decryptedJson = await decryptData(
  JSON.parse(JSON.stringify(encryptedJson))
);
const deploymentStatus = await initiateCompute(
  args[0],
  decryptedJson.worker_ipaddress.trim()
);
return Functions.encodeString(deploymentStatus.message);
