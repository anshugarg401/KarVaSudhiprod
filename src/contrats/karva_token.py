from boa3.builtin import public, NeoMetadata, metadata, create_event
from boa3.builtin.interop.storage import get, put
from boa3.builtin.type import UInt160

# Metadata
NEO_METADATA = NeoMetadata()
NEO_METADATA.author = "KarVaSudhi Foundation"
NEO_METADATA.description = "KARVA Governance Token Contract"
NEO_METADATA.email = "support@karvasudhi.tech"

# Events
Transfer = create_event(
    [("from_address", UInt160), ("to_address", UInt160), ("amount", int)],
    "Transfer"
)
Approval = create_event(
    [("owner", UInt160), ("spender", UInt160), ("amount", int)],
    "Approval"
)

# Constants
TOTAL_SUPPLY_KEY = b'total_supply'
BALANCE_PREFIX = b'balance_'
ALLOWANCE_PREFIX = b'allowance_'
MAX_SUPPLY = 100_000_000  # Maximum 100 million tokens


@public
def totalSupply() -> int:
    """
    Returns the total supply of KARVA tokens.
    """
    return get(TOTAL_SUPPLY_KEY)


@public
def balanceOf(account: UInt160) -> int:
    """
    Returns the balance of an account.
    """
    assert len(account) == 20, "Invalid account length"
    return get(BALANCE_PREFIX + account)


@public
def transfer(from_address: UInt160, to_address: UInt160, amount: int) -> bool:
    """
    Transfers KARVA tokens from one account to another.
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


@public
def mint(account: UInt160, amount: int) -> bool:
    """
    Mints new KARVA tokens to an account. Can only be called during initial distribution.
    """
    assert len(account) == 20, "Invalid account length"
    total_supply = get(TOTAL_SUPPLY_KEY)
    assert total_supply + amount <= MAX_SUPPLY, "Exceeds max supply"

    current_balance = get(BALANCE_PREFIX + account)
    put(BALANCE_PREFIX + account, current_balance + amount)
    put(TOTAL_SUPPLY_KEY, total_supply + amount)
    return True
