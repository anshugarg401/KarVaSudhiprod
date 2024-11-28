from boa3.builtin import public, NeoMetadata, metadata, create_event
from boa3.builtin.type import UInt160
from boa3.builtin.contract import abort
from boa3.builtin.interop.runtime import check_witness, get_time
from boa3.builtin.interop.storage import get, put, delete

# Metadata
NEO_METADATA = NeoMetadata()
NEO_METADATA.author = "KarVaSudhi Foundation"
NEO_METADATA.email = "support@karvasudhi.tech"
NEO_METADATA.description = "KV1Cert NFT Contract for Carbon Offset Verification"

# Events
CertificateMinted = create_event(
    [("owner", UInt160), ("token_id", int), ("carbon_offset", int), ("expiry", int)],
    "CertificateMinted"
)

CertificateBurned = create_event(
    [("owner", UInt160), ("token_id", int)], "CertificateBurned"
)

# Storage keys
TOKEN_ID_KEY = b'token_id'  # Tracks current token ID
TOKEN_OWNER_KEY = b'owner_'  # Tracks token ownership
TOKEN_DATA_KEY = b'data_'  # Tracks token metadata

@public
def mint_certificate(owner: UInt160, carbon_offset: int, expiry_days: int) -> int:
    """
    Mints a KV1Cert NFT for a given owner, carbon offset, and expiry period.

    :param owner: Address of the NFT owner.
    :param carbon_offset: Amount of carbon offset in tonnes.
    :param expiry_days: Validity period of the certificate in days.
    :return: The token ID of the minted NFT.
    """
    assert check_witness(owner), "Unauthorized operation."
    assert carbon_offset > 0, "Carbon offset must be positive."
    assert expiry_days > 0, "Expiry period must be positive."

    current_token_id = get(TOKEN_ID_KEY, 0)
    new_token_id = current_token_id + 1

    expiry_timestamp = get_time() + (expiry_days * 86400)  # Convert days to seconds
    metadata = f"{{'carbon_offset': {carbon_offset}, 'expiry': {expiry_timestamp}}}"

    # Store token data
    put(TOKEN_ID_KEY, new_token_id)
    put(TOKEN_OWNER_KEY + new_token_id.to_bytes(), owner)
    put(TOKEN_DATA_KEY + new_token_id.to_bytes(), metadata)

    CertificateMinted(owner, new_token_id, carbon_offset, expiry_timestamp)
    return new_token_id

@public
def burn_certificate(owner: UInt160, token_id: int) -> bool:
    """
    Burns an NFT, removing it from the blockchain.

    :param owner: Address of the NFT owner.
    :param token_id: The ID of the token to burn.
    :return: True if the operation is successful, False otherwise.
    """
    assert check_witness(owner), "Unauthorized operation."
    stored_owner = get(TOKEN_OWNER_KEY + token_id.to_bytes(), None)
    assert stored_owner == owner, "Token does not belong to the owner."

    # Remove token data
    delete(TOKEN_OWNER_KEY + token_id.to_bytes())
    delete(TOKEN_DATA_KEY + token_id.to_bytes())

    CertificateBurned(owner, token_id)
    return True

@public
def get_certificate_data(token_id: int) -> str:
    """
    Retrieves metadata for a given certificate token.

    :param token_id: The ID of the token.
    :return: Metadata as a JSON string.
    """
    metadata = get(TOKEN_DATA_KEY + token_id.to_bytes(), None)
    assert metadata is not None, "Token does not exist."
    return metadata

@public
def is_certificate_valid(token_id: int) -> bool:
    """
    Checks if a certificate is still valid.

    :param token_id: The ID of the token.
    :return: True if the certificate is valid, False otherwise.
    """
    metadata = get_certificate_data(token_id)
    expiry = int(metadata['expiry'])
    return get_time() <= expiry
