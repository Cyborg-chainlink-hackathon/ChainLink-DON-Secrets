# ChainLink-DON-Secrets

This project utilizes Chainlink Decentralized Oracle Networks (DON) to securely manage sensitive data. A critical element of this security is the storage of the STATIC_URL within the DON network. By keeping the STATIC_URL—which serves as a backend server for decrypting IPFS data—securely within the DON, the project significantly mitigates the risk of network attacks. This approach ensures that the STATIC_URL remains hidden from potential attackers, maintaining the integrity and confidentiality of the decryption process.

Furthermore, the project leverages both the IPFS gateway and Sepolia testnet gateway of QuickNode to enhance robust security and reliability in data handling. These gateways ensure efficient and secure storage and retrieval of data, reinforcing the overall security architecture of the project.

## Installation

To set up the project locally, follow these steps:

1. Clone the repository:
   ```sh
   git clone https://github.com/Cyborg-chainlink-hackathon/ChainLink-DON-Secrets.git
   ```
2. Navigate to the project directory:
    ```
    cd ChainLink-DON-Secrets
    ```
3. Install dependencies:
    ```
    npm install
    ```

## Usage
- Store the secrets in DON network:
    ```
    node src/StoreSecrets.js
    ```
    
## Functionalities:
**StoreSecrets.js**
1. Reads and configures the necessary parameters and environment variables.
2. Simulates the execution of a Chainlink DON script to ensure it runs correctly.
3. Encrypts and uploads secrets to the DON network.


**DON_script.js**

This is a Chain link function, which is executed by the DON network. This script integrates multiple services to securely handle encrypted data from IPFS, decrypt it, and use it to initiate a deployment on a worker node, all while ensuring error handling at each step.
1. Check for Required Secrets: Ensures that the staticUrl is set in the secrets.
2. Download from IPFS: Fetches encrypted data from IPFS.
3. Decrypt Data: Sends the encrypted data to a decryption service and retrieves the decrypted IP address of a worker.
4. Initiate Compute Task: Uses the decrypted IP address of the provider and the image source provided in the arguments by the smart contract to schedule the Dockerized deployment in the Kubernetes cluster.
5. Return Result: Encodes and returns the deployment status message along with the deployment details.
