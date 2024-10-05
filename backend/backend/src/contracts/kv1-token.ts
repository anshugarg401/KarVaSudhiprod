import { SmartContract, Address, Integer, Hash160 } from '@neo-one/smart-contract';

// Define KV1 token contract
export class KV1Token extends SmartContract {
  private balances: Map<Address, Integer> = new Map();
  private totalSupply: Integer = 1_000_000;

  public constructor() {
    super();
    // Initially assign all tokens to the contract owner
    const owner = Hash160('CONTRACT_OWNER_PUBLIC_KEY');
    this.balances.set(owner, this.totalSupply);
  }

  // Total supply of the token
  public totalSupply(): Integer {
    return this.totalSupply;
  }

  // Balance of an address
  public balanceOf(address: Address): Integer {
    return this.balances.get(address) || 0;
  }

  // Transfer function
  public transfer(from: Address, to: Address, amount: Integer): boolean {
    const fromBalance = this.balances.get(from) || 0;
    if (fromBalance < amount) {
      return false;
    }

    this.balances.set(from, fromBalance - amount);
    this.balances.set(to, (this.balances.get(to) || 0) + amount);
    return true;
  }
}
