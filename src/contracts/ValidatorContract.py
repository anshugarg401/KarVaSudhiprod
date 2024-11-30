from boa3.builtin import public, NeoMetadata, metadata, create_event
from boa3.builtin.type import UInt160
from boa3.builtin.interop.runtime import check_witness
from boa3.builtin.interop.storage import get, put
from requests import delete

# Metadata
NEO_METADATA = NeoMetadata()
NEO_METADATA.author = "KarVaSudhi Foundation"
NEO_METADATA.description = "Validator Contract"

# Events
ValidatorAdded = create_event([("validator", UInt160)], "ValidatorAdded")
ValidatorRemoved = create_event([("validator", UInt160)], "ValidatorRemoved")
PowerDelegated = create_event([("delegator", UInt160), ("delegatee", UInt160)], "PowerDelegated")
ReadingValidated = create_event(
    [("validator", UInt160), ("dac_address", UInt160), ("reading_id", int)],
    "ReadingValidated"
)

# Storage Keys
VALIDATOR_KEY = b'validators_'
DELEGATED_KEY = b'delegated_'

@public
def add_validator(validator: UInt160) -> bool:
    """
    Add a new validator to the system.
    """
    assert check_witness(validator), "Unauthorized operation."
    put(VALIDATOR_KEY + validator, True)
    ValidatorAdded(validator)
    return True

@public
def remove_validator(validator: UInt160) -> bool:
    """
    Remove a validator from the system.
    """
    assert check_witness(validator), "Unauthorized operation."
    delete(VALIDATOR_KEY + validator)
    ValidatorRemoved(validator)
    return True

@public
def delegate_power(delegator: UInt160, delegatee: UInt160) -> bool:
    """
    Delegate validation power to another party.
    """
    assert check_witness(delegator), "Unauthorized operation."
    put(DELEGATED_KEY + delegator, delegatee)
    PowerDelegated(delegator, delegatee)
    return True

@public
def validate_reading(validator: UInt160, dac_address: UInt160, reading_id: int) -> bool:
    """
    Validate a DAC reading.
    """
    assert check_witness(validator), "Unauthorized operation."
    is_validator = get(VALIDATOR_KEY + validator)
    if is_validator is None:
        return False
    ReadingValidated(validator, dac_address, reading_id)
    return True
