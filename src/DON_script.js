async function downloadFromIPFS() {
    const ipfsResponse = await Functions.makeHttpRequest({
      url: args[0],
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (ipfsResponse.error) {
      throw new Error("Error downloading file from IPFS");
    }
    return ipfsResponse.data;
  }
  async function decryptData(encryptedData) {
    const response = await Functions.makeHttpRequest({
      url: `http://${args[3]}:3000/decrypt`,//fixedIP
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      data: { data: encryptedData, key: args[2] },
    });
    if (response.error) {
      throw new Error("Error decrypting data");
    }
    const decryptedData = JSON.parse(JSON.stringify(response.data));
    return decryptedData;
  }
  async function initiateCompute(imageSrc, ipAddress) {
    const url_d = `http://${ipAddress}:3001/deploy`;
    const response = await Functions.makeHttpRequest({
      url: url_d,
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
    args[1],
    decryptedJson.ipAddress.trim()
  );
  return Functions.encodeString(deploymentStatus.message);
  