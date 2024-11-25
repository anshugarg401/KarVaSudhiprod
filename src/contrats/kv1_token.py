from boa3.builtin import public, NeoMetadata, metadata, create_event
from boa3.builtin.interop.runtime import get_time
from boa3.builtin.interop.storage import get, put
from boa3.builtin.type import UInt160

# Metadata
NEO_METADATA = NeoMetadata()
NEO_METADATA.author = "KarVaSudhi Foundation"
NEO_METADATA.description = "KV1 Utility Token Contract"
NEO_METADATA.email = "support@karvasudhi.tech"

# Events
Transfer = create_event(
    [("from_address", UInt160), ("to_address", UInt160), ("amount", int)],
    "Transfer"
)
Mint = create_event(
    [("to_address", UInt160), ("amount", int)],
    "Mint"
)

# Constants
MINT_INTERVAL = 3600  # Tokens mintable every hour
TOKEN_CAP = 1_000_000_000  # Total cap of 1 billion KV1 tokens
KV1_TOTAL_SUPPLY_KEY = b'total_supply_kv1'
BALANCE_PREFIX = b'balance_kv1_'
LAST_MINT_KEY = b'last_mint_kv1'


@public
def totalSupply() -> int:
    """
    Returns the total supply of KV1 tokens.
    """
    return get(KV1_TOTAL_SUPPLY_KEY)


@public
def balanceOf(account: UInt160) -> int:
    """
    Returns the balance of an account.
    """
    assert len(account) == 20, "Invalid account length"
    return get(BALANCE_PREFIX + account)


@public
def mint(to_address: UInt160, amount: int) -> bool:
    """
    Mints KV1 tokens for a user. Minting can only happen at set intervals.
    """
    assert len(to_address) == 20, "Invalid address"
    assert amount > 0, "Mint amount must be positive"

    last_mint_time = get(LAST_MINT_KEY)
    current_time = get_time()
    assert current_time - last_mint_time >= MINT_INTERVAL, "Minting too soon"

    total_supply = get(KV1_TOTAL_SUPPLY_KEY)
    assert total_supply + amount <= TOKEN_CAP, "Exceeds token cap"

    user_balance = get(BALANCE_PREFIX + to_address)
    put(BALANCE_PREFIX + to_address, user_balance + amount)
    put(KV1_TOTAL_SUPPLY_KEY, total_supply + amount)
    put(LAST_MINT_KEY, current_time)

    Mint(to_address, amount)
    return True


@public
def transfer(from_address: UInt160, to_address: UInt160, amount: int) -> bool:
    """
    Transfers KV1 tokens from one account to another.
    """
    assert len(from_address) == 20 and len(to_address) == 20, "Invalid account length"
    assert amount > 0, "Transfer amount must be positive"
    from_balance = get(BALANCE_PREFIX + from_address)
    assert from_balance >= amount, "Insufficient balance"

    put(BALANCE_PREFIX + from_address, from_balance - amount)
    to_balance = get(BALANCE_PREFIX + to_address)
    put(BALANCE_PREFIX + to_address, to_balance + amount)

    Transfer(from_address, to_address, amount)
    return True
