from boa3.builtin import public, NeoMetadata, metadata, create_event
from boa3.builtin.interop.storage import get, put, delete
from boa3.builtin.interop.runtime import check_witness
from boa3.builtin.interop.iterator import Iterator
from boa3.builtin.interop.blockchain import get_current_index
from boa3.builtin.type import UInt160

NEO_METADATA = NeoMetadata()
NEO_METADATA.author = "KarVaSudhi Team"
NEO_METADATA.description = "Marketplace for SUDHI, KV1, and KARVA tokens"

# Events
OrderCreated = create_event(
    [("order_id", int), ("creator", UInt160), ("token", str), ("quantity", int), ("price", int)],
    "OrderCreated"
)
OrderMatched = create_event(
    [("order_id", int), ("buyer", UInt160), ("seller", UInt160), ("quantity", int)],
    "OrderMatched"
)
FeeCollected = create_event([("amount", int), ("collector", UInt160)], "FeeCollected")

# Storage keys
ORDER_ID_KEY = b'order_id'
ORDERS_KEY = b'orders_'
TRADE_FEE_PERCENTAGE = 150  # 1.5% fee

@public
def create_order(token: str, quantity: int, price: int, seller: UInt160) -> int:
    """
    Creates a new order in the marketplace.
    """
    assert quantity > 0 and price > 0, "Invalid quantity or price."
    assert check_witness(seller), "Unauthorized"

    order_id = get_order_id()
    order_key = ORDERS_KEY + order_id.to_bytes()

    put(order_key, (seller, token, quantity, price))
    increment_order_id()
    OrderCreated(order_id, seller, token, quantity, price)
    return order_id


@public
def match_order(order_id: int, buyer: UInt160, quantity: int) -> bool:
    """
    Matches an existing order with a buyer.
    """
    assert check_witness(buyer), "Unauthorized"

    order_key = ORDERS_KEY + order_id.to_bytes()
    order = get(order_key)
    assert order is not None, "Order not found"

    seller, token, available_quantity, price = order
    assert quantity <= available_quantity, "Insufficient quantity in order"

    total_price = price * quantity
    fee = (total_price * TRADE_FEE_PERCENTAGE) // 10000
    net_price = total_price - fee

    # Deduct tokens and update balances
    deduct_token(buyer, token, quantity)
    credit_token(seller, token, net_price)

    # Emit events
    OrderMatched(order_id, buyer, seller, quantity)
    FeeCollected(fee, seller)

    # Update or delete order
    if quantity == available_quantity:
        delete(order_key)
    else:
        put(order_key, (seller, token, available_quantity - quantity, price))

    return True


@public
def get_order(order_id: int) -> dict:
    """
    Returns the details of an order.
    """
    order_key = ORDERS_KEY + order_id.to_bytes()
    order = get(order_key)
    return {"seller": order[0], "token": order[1], "quantity": order[2], "price": order[3]} if order else {}


def deduct_token(account: UInt160, token: str, amount: int):
    """
    Deducts the specified amount of tokens from the account.
    """
    # Implement the logic to deduct tokens from the account
    pass


def credit_token(account: UInt160, token: str, amount: int):
    """
    Credits the specified amount of tokens to the account.
    """
    # Implement the logic to credit tokens to the account
    pass


def get_order_id() -> int:
    """
    Fetch the current order ID.
    """
    return get(ORDER_ID_KEY, 0)


def increment_order_id():
    """
    Increment the order ID.
    """
    current_id = get_order_id()
    put(ORDER_ID_KEY, current_id + 1)
