import {
  LocalKeyStore,
  LocalUserAccountProvider,
  NEOONEProvider,
} from '@neo-one/client';

// Initialize the local keystore for account management
const localStore = new LocalStore();
const keystore = new LocalKeyStore(localStore);

// Create a NEO client provider (could point to testnet or mainnet)
const provider = new NEOONEProvider();

// Initialize the account provider using the keystore
const accountProvider = new LocalUserAccountProvider({ keystore, provider });

// Function to create an account and display its private key and address
const createAccount = async (): Promise<void> => {
  try {
    // Generate a new account
    const account = await keystore.addAccount();

    // Print the account details
    console.log('Private Key:', account.privateKey);
    console.log('Public Address:', account.address);
  } catch (error) {
    console.error('Error creating account:', error);
  }
};

// Run the account creation function
createAccount();
