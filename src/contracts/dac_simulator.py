from boa3.builtin.contract import NeoMetadata  # Metadata for the smart contract
from boa3.builtin.interop.runtime import time, Log  # For timestamps and logging
from boa3.builtin.interop.storage import get, put  # For storage operations
from boa3.builtin.type import UInt160  # For address types

# Metadata for the contract
metadata = NeoMetadata()
metadata.author = "KarVaSudhi Foundation"
metadata.description = "DAC Simulator for KarVaSudhi"
metadata.email = "support@karvasudhi.tech"
metadata.extras = {"version": "1.0.0", "website": "https://karvasudhi.tech"}

# Storage Keys
DAC_TOTAL_STORAGE_KEY = b'total_dac_'
READING_COUNTER_KEY = b'counter_'
READINGS_LIST_KEY = b'readings_list_'  # For storing individual readings


def simulate_dac_reading(dac_address: UInt160, carbon_reading: int) -> bool:
    """
    Generates and stores a mock carbon sequestration reading for a DAC project.

    Args:
        dac_address (UInt160): The address of the DAC project.
        carbon_reading (int): The amount of carbon sequestered in tonnes.

    Returns:
        bool: True if the operation is successful.
    """
    assert len(dac_address) == 20, "Invalid DAC address."
    assert carbon_reading > 0, "Carbon reading must be positive."

    # Keys for storage
    reading_counter_key = READING_COUNTER_KEY + dac_address
    total_key = DAC_TOTAL_STORAGE_KEY + dac_address
    readings_list_key = READINGS_LIST_KEY + dac_address

    # Increment the reading counter
    current_counter_bytes = get(reading_counter_key)
    current_counter = int.from_bytes(current_counter_bytes, "little") if current_counter_bytes else 0

    # Store the new reading
    reading_key = (current_counter).to_bytes(4, "little")
    put(readings_list_key + reading_key, carbon_reading)
    put(reading_counter_key, (current_counter + 1).to_bytes(4, "little"))

    # Update the total carbon sequestered
    previous_total_bytes = get(total_key)
    previous_total = int.from_bytes(previous_total_bytes, "little") if previous_total_bytes else 0
    new_total = previous_total + carbon_reading
    put(total_key, new_total.to_bytes(8, "little"))

    # Log the event
    Log(f"ReadingSubmitted: DAC={dac_address}, Carbon={carbon_reading}, Time={time}")
    return True


def get_total_sequestration(dac_address: UInt160) -> int:
    """
    Retrieves the total carbon sequestration recorded for a DAC project.

    Args:
        dac_address (UInt160): The address of the DAC project.

    Returns:
        int: The total carbon sequestration in tonnes.
    """
    assert len(dac_address) == 20, "Invalid DAC address."
    total_key = DAC_TOTAL_STORAGE_KEY + dac_address
    total_bytes = get(total_key)
    return int.from_bytes(total_bytes, "little") if total_bytes else 0


def get_reading(dac_address: UInt160, reading_index: int) -> int:
    """
    Retrieves a specific reading for a DAC project by index.

    Args:
        dac_address (UInt160): The address of the DAC project.
        reading_index (int): The index of the reading to retrieve.

    Returns:
        int: The carbon reading in tonnes.
    """
    assert len(dac_address) == 20, "Invalid DAC address."
    assert reading_index >= 0, "Reading index must be non-negative."

    readings_list_key = READINGS_LIST_KEY + dac_address
    reading_key = reading_index.to_bytes(4, "little")
    reading_bytes = get(readings_list_key + reading_key)
    return int.from_bytes(reading_bytes, "little") if reading_bytes else 0


def get_reading_count(dac_address: UInt160) -> int:
    """
    Retrieves the total count of readings for a DAC project.

    Args:
        dac_address (UInt160): The address of the DAC project.

    Returns:
        int: The total number of readings.
    """
    assert len(dac_address) == 20, "Invalid DAC address."
    reading_counter_key = READING_COUNTER_KEY + dac_address
    current_counter_bytes = get(reading_counter_key)
    return int.from_bytes(current_counter_bytes, "little") if current_counter_bytes else 0
