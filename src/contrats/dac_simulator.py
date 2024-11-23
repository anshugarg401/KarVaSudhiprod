from boa3.builtin import public, NeoMetadata, metadata, create_event
from boa3.builtin.type import UInt160
from boa3.builtin.interop.runtime import get_time
from boa3.builtin.interop.blockchain import get_current_index
from boa3.builtin.interop.storage import get, put

# Metadata
NEO_METADATA = NeoMetadata()
NEO_METADATA.author = "KarVaSudhi Foundation"
NEO_METADATA.email = "support@karvasudhi.tech"
NEO_METADATA.description = "DAC Simulator for KarVaSudhi"

# Events
ReadingSubmitted = create_event(
    [("dac_address", UInt160), ("carbon_reading", int), ("timestamp", int)],
    "ReadingSubmitted"
)

# Storage Keys
DAC_TOTAL_STORAGE_KEY = b'total_dac_'
READING_COUNTER_KEY = b'counter_'
READINGS_LIST_KEY = b'readings_list_'  # For storing individual readings

@public
def simulate_dac_reading(dac_address: UInt160, carbon_reading: int) -> bool:
    """
    Generates and stores a mock carbon sequestration reading for a DAC project.
    
    Args:
        dac_address (UInt160): The address of the DAC project.
        carbon_reading (int): The amount of carbon sequestered in tonnes.
    
    Returns:
        bool: True if the operation is successful.
    """
    assert carbon_reading > 0, "Carbon reading must be positive."
    
    timestamp = get_time()
    reading_counter_key = READING_COUNTER_KEY + dac_address
    total_key = DAC_TOTAL_STORAGE_KEY + dac_address
    readings_list_key = READINGS_LIST_KEY + dac_address

    # Increment the reading counter
    current_counter = get(reading_counter_key)
    if current_counter is None:
        current_counter = 0
    else:
        current_counter = int.from_bytes(current_counter, "little")

    # Store the new reading
    reading_key = f"{current_counter}".encode("utf-8")  # Key for individual reading
    put(readings_list_key + reading_key, carbon_reading)
    put(reading_counter_key, (current_counter + 1).to_bytes(4, "little"))

    # Update the total carbon sequestered
    previous_total = get(total_key)
    if previous_total is None:
        previous_total = 0
    else:
        previous_total = int.from_bytes(previous_total, "little")
    new_total = previous_total + carbon_reading
    put(total_key, new_total.to_bytes(8, "little"))

    # Emit an event for validators
    ReadingSubmitted(dac_address, carbon_reading, timestamp)
    return True

@public
def get_total_sequestration(dac_address: UInt160) -> int:
    """
    Retrieves the total carbon sequestration recorded for a DAC project.
    
    Args:
        dac_address (UInt160): The address of the DAC project.
    
    Returns:
        int: The total carbon sequestration in tonnes.
    """
    total_key = DAC_TOTAL_STORAGE_KEY + dac_address
    total = get(total_key)
    if total is None:
        return 0
    return int.from_bytes(total, "little")

@public
def get_reading(dac_address: UInt160, reading_index: int) -> int:
    """
    Retrieves a specific reading for a DAC project by index.
    
    Args:
        dac_address (UInt160): The address of the DAC project.
        reading_index (int): The index of the reading to retrieve.
    
    Returns:
        int: The carbon reading in tonnes.
    """
    readings_list_key = READINGS_LIST_KEY + dac_address
    reading_key = f"{reading_index}".encode("utf-8")
    reading = get(readings_list_key + reading_key)
    if reading is None:
        return 0
    return int.from_bytes(reading, "little")

@public
def get_reading_count(dac_address: UInt160) -> int:
    """
    Retrieves the total count of readings for a DAC project.
    
    Args:
        dac_address (UInt160): The address of the DAC project.
    
    Returns:
        int: The total number of readings.
    """
    reading_counter_key = READING_COUNTER_KEY + dac_address
    current_counter = get(reading_counter_key)
    if current_counter is None:
        return 0
    return int.from_bytes(current_counter, "little")
