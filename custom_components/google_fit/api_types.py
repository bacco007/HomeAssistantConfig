"""TypeDefinition for Google Fit API."""
from datetime import datetime
from typing import TypedDict, Any
from collections.abc import Callable
from dataclasses import dataclass
from homeassistant.components.sensor import SensorEntityDescription
from googleapiclient.discovery import Resource
from googleapiclient.http import BatchHttpRequest


class FitService(Resource):
    """Service implementation for the Fit API."""

    users: Callable[[], Any]
    new_batch_http_request: Callable[[Callable[..., None]], BatchHttpRequest]


class FitnessData(TypedDict):
    """All the fitness data retrieved from the API."""

    lastUpdate: datetime
    activeMinutes: float | None
    calories: float | None
    basalMetabolicRate: float | None
    distance: float | None
    heartMinutes: float | None
    height: float | None
    weight: float | None
    bodyFat: float | None
    bodyTemperature: float | None
    steps: int | None
    awakeSeconds: float | None
    sleepSeconds: float | None
    lightSleepSeconds: float | None
    deepSleepSeconds: float | None
    remSleepSeconds: float | None
    heartRate: float | None
    heartRateResting: float | None
    bloodPressureSystolic: float | None
    bloodPressureDiastolic: float | None
    bloodGlucose: float | None
    hydration: float | None
    oxygenSaturation: float | None


class FitnessValue(TypedDict):
    """Representation of a the value of a single data point returned from the Google Fit API.

    See:
    https://googleapis.github.io/google-api-python-client/docs/dyn/fitness_v1.users.dataSources.datasets
    """

    fpVal: float | None
    intVal: int | None
    stringVal: str | None


class FitnessPoint(TypedDict):
    """Representation of a single data point returned from the Google Fit API.

    See:
    https://googleapis.github.io/google-api-python-client/docs/dyn/fitness_v1.users.dataSources.datasets
    """

    dataTypeName: str
    endTimeNanos: str
    modifiedTimeMillis: str
    rawTimestampNanos: str
    startTimeNanos: str
    value: list[FitnessValue]


class FitnessObject(TypedDict):
    """Representation of the data returned from the Google Fit API.

    See:
    https://googleapis.github.io/google-api-python-client/docs/dyn/fitness_v1.users.dataSources.datasets
    """

    dataSourceId: str
    maxEndTimeNs: str
    minStartTimeNs: str
    nextPageToken: str
    point: list[FitnessPoint]


class FitnessDataPoint(TypedDict):
    """Representation of a data point change returned from the Google Fit API.

    See:
    https://googleapis.github.io/google-api-python-client/docs/dyn/fitness_v1.users.dataSources.dataPointChanges
    """

    dataSourceId: str
    deletedDataPoint: list[FitnessPoint]
    insertedDataPoint: list[FitnessPoint]
    nextPageToken: str


class FitnessDataStream(TypedDict):
    """Minimal representation of a data source returned from the Google Fit API.

    See:
    https://googleapis.github.io/google-api-python-client/docs/dyn/fitness_v1.users.dataSources.html#list
    """

    dataStreamName: str
    dataStreamId: str
    type: str


class FitnessDataSource(TypedDict):
    """Minimal representation of a data source returned from the Google Fit API.

    See:
    https://googleapis.github.io/google-api-python-client/docs/dyn/fitness_v1.users.dataSources.html#list
    """

    dataSource: list[FitnessDataStream]


class FitnessSession(TypedDict):
    """Representation of a single session returned in response from Google Fit API.

    See:
    https://googleapis.github.io/google-api-python-client/docs/dyn/fitness_v1.users.sessions.html#list
    """

    activeTimeMillis: str
    activityType: int
    description: str
    endTimeMillis: str
    id: str
    modifiedTimeMillis: str
    name: str
    startTimeMillis: str


class FitnessSessionResponse(TypedDict):
    """Representation of a session response returned from the Google Fit API.

    See:
    https://googleapis.github.io/google-api-python-client/docs/dyn/fitness_v1.users.sessions.html#list
    """

    deletedSession: None
    hasMoreData: None
    nextPageToken: str | None
    session: list[FitnessSession]


@dataclass
class GoogleFitSensorDescription(SensorEntityDescription):
    """Extends Sensor Description types to add necessary component values."""

    data_key: str = "undefined"
    source: str = "undefined"
