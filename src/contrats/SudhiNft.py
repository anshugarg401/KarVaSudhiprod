from boa3.builtin import public, NeoMetadata, metadata, create_event
from boa3.builtin.type import UInt160
from boa3.builtin.interop.runtime import check_witness
from boa3.builtin.interop.storage import get, put, delete
from boa3.builtin.interop.blockchain import get_current_index

# Metadata
NEO_METADATA = NeoMetadata()
NEO_METADATA.author = "KarVaSudhi Foundation"
NEO_METADATA.description = "SUDHI NFT Smart Contract"

# Events
NFTMinted = create_event(
    [("owner", UInt160), ("nft_id", int), ("carbon_amount", int), ("timestamp", int)],
    "NFTMinted"
)
NFTTransferred = create_event(
    [("from", UInt160), ("to", UInt160), ("nft_id", int)],
    "NFTTransferred"
)

# Storage Keys
OWNER_STORAGE_KEY = b'owner_'
NFT_DATA_STORAGE_KEY = b'data_'
NFT_COUNTER_KEY = b'nft_counter'

@public
def mint_nft(owner: UInt160, carbon_amount: int) -> bool:
    """
    Mint a new NFT representing a carbon sequestration amount.
    
    Args:
        owner (UInt160): The address of the NFT owner.
        carbon_amount (int): The carbon amount represented by the NFT in tonnes.
    
    Returns:
        bool: True if minting is successful.
    """
    assert check_witness(owner), "Unauthorized minting attempt."
    assert carbon_amount > 0, "Carbon amount must be positive."

    nft_counter = get(NFT_COUNTER_KEY)
    if nft_counter is None:
        nft_counter = 0
    else:
        nft_counter = int.from_bytes(nft_counter, "little")

    nft_id = nft_counter + 1
    timestamp = get_current_index()

    # Store NFT details
    nft_key = NFT_DATA_STORAGE_KEY + nft_id.to_bytes(4, "little")
    put(nft_key, carbon_amount.to_bytes(4, "little"))
    put(OWNER_STORAGE_KEY + nft_id.to_bytes(4, "little"), owner)
    put(NFT_COUNTER_KEY, nft_id.to_bytes(4, "little"))

    # Emit NFT minting event
    NFTMinted(owner, nft_id, carbon_amount, timestamp)
    return True

@public
def transfer_nft(nft_id: int, to: UInt160) -> bool:
    """
    Transfer ownership of an NFT to another address.
    
    Args:
        nft_id (int): The ID of the NFT.
        to (UInt160): The recipient's address.
    
    Returns:
        bool: True if transfer is successful.
    """
    current_owner = get(OWNER_STORAGE_KEY + nft_id.to_bytes(4, "little"))
    assert current_owner is not None, "NFT does not exist."
    assert check_witness(current_owner), "Unauthorized transfer attempt."

    put(OWNER_STORAGE_KEY + nft_id.to_bytes(4, "little"), to)
    NFTTransferred(current_owner, to, nft_id)
    return True

@public
def get_nft_owner(nft_id: int) -> UInt160:
    """
    Retrieve the owner of an NFT.
    
    Args:
        nft_id (int): The ID of the NFT.
    
    Returns:
        UInt160: The address of the owner.
    """
    owner = get(OWNER_STORAGE_KEY + nft_id.to_bytes(4, "little"))
    if owner is None:
        return UInt160()
    return owner
