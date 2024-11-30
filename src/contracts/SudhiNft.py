from boa3.builtin import public, NeoMetadata, metadata, create_event
from boa3.builtin.type import UInt160
from boa3.builtin.interop.runtime import check_witness
from boa3.builtin.interop.storage import get, put

# Metadata
NEO_METADATA = NeoMetadata()
NEO_METADATA.author = "KarVaSudhi Team"
NEO_METADATA.description = "SUDHI Token with Tradeability and Carbon Byproduct Support"

# Events
Transfer = create_event([("from", UInt160), ("to", UInt160), ("amount", int)], "Transfer")
TokenStatusUpdated = create_event([("token_id", int), ("status", str)], "TokenStatusUpdated")

# Storage Keys
BALANCES_KEY = b'balances_'
TOTAL_SUPPLY_KEY = b'total_supply'
STATUS_KEY = b'status_'

# Token Config
TOTAL_SUPPLY = 1_000_000  # 1 million tokens initially minted

@public
def symbol() -> str:
    """
    Returns the token symbol.
    """
    return "SUDHI"

@public
def decimals() -> int:
    """
    Returns the number of decimal places.
    """
    return 8

@public
def total_supply() -> int:
    """
    Returns the total supply of the token.
    """
    return get(TOTAL_SUPPLY_KEY, TOTAL_SUPPLY)

@public
def balance_of(account: UInt160) -> int:
    """
    Returns the balance of a given account.
    """
    return get(BALANCES_KEY + account, 0)

@public
def transfer(from_account: UInt160, to_account: UInt160, amount: int) -> bool:
    """
    Transfers tokens from one account to another.
    """
    assert amount > 0, "Amount must be greater than zero."
    assert check_witness(from_account), "Unauthorized transfer."
    assert from_account != to_account, "Cannot transfer to the same account."

    from_balance = balance_of(from_account)
    assert from_balance >= amount, "Insufficient balance."

    to_balance = balance_of(to_account)

    # Update balances
    put(BALANCES_KEY + from_account, from_balance - amount)
    put(BALANCES_KEY + to_account, to_balance + amount)

    Transfer(from_account, to_account, amount)
    return True

@public
def mint(account: UInt160, amount: int) -> bool:
    """
    Mints new tokens and assigns them to an account.
    """
    assert amount > 0, "Mint amount must be greater than zero."
    assert check_witness(account), "Unauthorized minting."

    total_supply = get(TOTAL_SUPPLY_KEY, TOTAL_SUPPLY)
    new_total_supply = total_supply + amount
    put(TOTAL_SUPPLY_KEY, new_total_supply)

    account_balance = balance_of(account)
    put(BALANCES_KEY + account, account_balance + amount)

    Transfer(UInt160(), account, amount)  # Emit Transfer event for minting
    return True

@public
def set_token_status(token_id: int, status: str) -> bool:
    """
    Updates the status of a token (e.g., 'Offset-Ready', 'Byproduct-Tradeable').
    """
    assert status in ['Offset-Ready', 'Byproduct-Tradeable'], "Invalid status."
    put(STATUS_KEY + token_id.to_bytes(), status)
    TokenStatusUpdated(token_id, status)
    return True

@public
def get_token_status(token_id: int) -> str:
    """
    Retrieves the status of a token.
    """
    return get(STATUS_KEY + token_id.to_bytes(), "Offset-Ready")
