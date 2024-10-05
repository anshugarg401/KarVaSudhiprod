import { Client, LocalUserAccountProvider, LocalKeyStore, NEOONEProvider } from '@neo-one/client';

const provider = new NEOONEProvider();
const keystore = new LocalKeyStore();
const client = new Client({ 
  localProvider: provider,
  keystore,
});

// Transfer KV1 Tokens
export const transferKV1Tokens = async (from, to, amount) => {
  const result = await client.executeScript({
    contractHash: 'KV1_TOKEN_CONTRACT_HASH',
    operation: 'transfer',
    args: [from, to, amount],
  });
  return result;
};

// Mint Sudhi NFT
export const mintSudhiNFT = async (to, tokenId) => {
  const result = await client.executeScript({
    contractHash: 'SUDHI_NFT_CONTRACT_HASH',
    operation: 'mint',
    args: [to, tokenId],
  });
  return result;
};
