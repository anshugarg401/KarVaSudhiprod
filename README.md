
# **KārVāSudhī Project**

## **Overview**

KārVāSudhī is a blockchain-based platform dedicated to promoting carbon sequestration projects such as Direct Air Capture (DAC) and reforestation efforts. The project leverages Neo N3 blockchain and smart contracts to facilitate transparent and verifiable carbon sequestration through SUDHI NFTs and utility tokens like KARVA and KV1.

This repository contains the smart contracts, scripts, and integrations required to interact with the system. It also includes mock DAC simulators for testing on the Neo TestNet.

---

## **Features**

1. **DAC Simulation**  
   Simulate and submit mock DAC readings to test the platform functionality on the Neo TestNet.

2. **SUDHI NFT Minting**  
   Mint NFTs representing carbon sequestration achievements based on validated DAC readings.

3. **Validation System**  
   Validate DAC readings using delegated validators to ensure integrity and prevent fraud.

4. **Token Economy**  
   Manage KARVA (utility token) and KV1 (carbon credit representation) tokens.

5. **Decentralized Delegation**  
   Delegate validator powers to multiple parties securely via smart contracts.

6. **Neo Integration**  
   Fully integrated with Neo N3 blockchain using Neo Boa for smart contracts and Neon.js for interaction.

---

## **Setup**

### **Prerequisites**
- **Python 3.8+** with Neo Boa installed
- **Node.js 16+** with TypeScript
- **Neo N3 TestNet Wallet** with funds for testing

### **Install Dependencies**
1. Clone the repository:
   ```bash
   git clone https://github.com/anshugarg401/KarVaSudhiprod/tree/dacKarVaSudhi.git
   cd karvasudhi
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Install Node.js dependencies:
   ```bash
   npm install
   ```

---

## **Usage**

### **Simulate DAC Readings**
Run the `simulateDACReading.ts` script to submit a DAC reading:
```bash
npx ts-node scripts/simulateDACReading.ts
```

### **Validate DAC Readings**
Validate the submitted readings using `validateDACReading.ts`:
```bash
npx ts-node scripts/validateDACReading.ts
```

### **Mint SUDHI NFTs**
Mint an NFT based on validated DAC readings:
```bash
npx ts-node scripts/mintSudhiNFT.ts
```

### **Delegate Validator Powers**
Delegate validator powers to another account:
```bash
npx ts-node scripts/delegateValidatorPowers.ts
```

---

## **Smart Contract Deployment**

### **Deploying Contracts**
Use the Neo Boa framework to compile and deploy the Python smart contracts. Follow these steps:

1. Compile the smart contract:
   ```bash
   boa compile contracts/dac_simulator.py
   ```

2. Deploy the contract using Neo CLI or compatible tools.

### **Contract Hashes**
Update the script files with your deployed contract hashes.

---

## **Testing**

Run the Python tests for the smart contracts:
```bash
pytest tests/
```

---

## **License**

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## **Contact**

For support or inquiries, contact us at **support@karvasudhi.tech**.  