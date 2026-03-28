from enum import Enum

# --------------------------
# General descriptive stats
# --------------------------
class DescriptiveStatistic(str, Enum):
    average = "average"
    maximum = "maximum"
    minimum = "minimum"

# --------------------------
# Physical activity
# --------------------------
class TemporalRelationship(str, Enum):
    before_exercise = "before exercise"
    after_exercise = "after exercise"
    during_exercise = "during exercise"
    at_rest = "at rest"

# --------------------------
# Sleep
# --------------------------
class TemporalRelationshipToSleep(str, Enum):
    before_sleep = "before sleep"
    during_sleep = "during sleep"
    after_sleep = "after sleep"

# --------------------------
# Body posture
# --------------------------
class BodyPosture(str, Enum):
    sitting = "sitting"
    standing = "standing"
    lying = "lying"
    reclining = "reclining"

# --------------------------
# Measurement locations
# --------------------------
class MeasurementLocation(str, Enum):
    left_wrist = "left wrist"
    right_wrist = "right wrist"
    left_arm = "left arm"
    right_arm = "right arm"

# --------------------------
# Units
# --------------------------
class HeartRateUnit(str, Enum):
    beats_per_min = "beats/min"

class BloodPressureUnit(str, Enum):
    mmHg = "mmHg"