import { SmartContract, Address, Integer, MapStorage, Blockchain } from '@neo-one/smart-contract';

// Define Sudhi NFT Contract
export class SudhiNFT extends SmartContract {
  private nfts: MapStorage<Address, string> = new MapStorage();

  // Mint a new NFT representing a conservation effort
  public mint(to: Address, tokenId: string): void {
    this.nfts.set(to, tokenId);
  }

  // Transfer NFT from one user to another
  public transfer(from: Address, to: Address, tokenId: string): boolean {
    const nft = this.nfts.get(from);
    if (nft !== tokenId) {
      return false;
    }
    this.nfts.delete(from);
    this.nfts.set(to, tokenId);
    return true;
  }

  // View owner of an NFT
  public ownerOf(tokenId: string): Address | undefined {
    for (const [owner, id] of this.nfts) {
      if (id === tokenId) {
        return owner;
      }
    }
    return undefined;
  }
}
