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


## Prescription


class AdministrationRoute(str, Enum):
    oral = "oral"
    iv = "iv"
    subcutaneous = "subcutaneous"
    intramuscular = "intramuscular"
    transdermal = "transdermal"


class PartOfDay(str, Enum):
    morning = "morning"
    afternoon = "afternoon"
    evening = "evening"
    night = "night"


class DayOfWeek(str, Enum):
    monday = "monday"
    tuesday = "tuesday"
    wednesday = "wednesday"
    thursday = "thursday"
    friday = "friday"
    saturday = "saturday"
    sunday = "sunday"


class TimeUnit(str, Enum):
    min = "min"
    h = "h"
    d = "d"
    wk = "wk"
    Mo = "Mo"
    yr = "yr"
