from boa3.builtin import public, NeoMetadata, metadata, create_event
from boa3.builtin.type import UInt160
from boa3.builtin.interop.storage import get, put, delete
from boa3.builtin.interop.runtime import get_time

# Metadata
NEO_METADATA = NeoMetadata()
NEO_METADATA.author = "KarVaSudhi Foundation"
NEO_METADATA.description = "SUDHI NFTs representing 1 tonne of sequestered carbon"
NEO_METADATA.email = "support@karvasudhi.tech"

# Events
NFTMinted = create_event(
    [("owner", UInt160), ("nft_id", int), ("timestamp", int)], "NFTMinted"
)
NFTBurned = create_event(
    [("nft_id", int), ("timestamp", int)], "NFTBurned"
)

# Storage Keys
NEXT_ID_KEY = b'sudhi_next_id'
NFT_DATA_KEY = b'sudhi_data_'

@public
def mint_sudhi(owner: UInt160, amount: int) -> bool:
    """
    Mints SUDHI NFTs for carbon sequestration based on DAC readings.
    """
    assert amount > 0, "Amount must be greater than zero."

    current_id = get(NEXT_ID_KEY)
    if current_id is None:
        current_id = 1

    timestamp = get_time()
    for _ in range(amount):
        nft_key = NFT_DATA_KEY + current_id.to_bytes()
        put(nft_key, {"owner": owner, "timestamp": timestamp})
        NFTMinted(owner, current_id, timestamp)
        current_id += 1

    put(NEXT_ID_KEY, current_id)
    return True

@public
def burn_sudhi(nft_id: int) -> bool:
    """
    Burns a SUDHI NFT.
    """
    nft_key = NFT_DATA_KEY + nft_id.to_bytes()
    nft_data = get(nft_key)
    assert nft_data is not None, "NFT does not exist."

    delete(nft_key)
    NFTBurned(nft_id, get_time())
    return True
