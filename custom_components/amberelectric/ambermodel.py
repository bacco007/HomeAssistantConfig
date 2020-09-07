from typing import Optional, Any, List, TypeVar, Type, cast, Callable
from enum import Enum
from datetime import datetime
import dateutil.parser


T = TypeVar("T")
EnumT = TypeVar("EnumT", bound=Enum)


def from_bool(x: Any) -> bool:
    assert isinstance(x, bool)
    return x


def from_str(x: Any) -> str:
    assert isinstance(x, str)
    return x


def from_none(x: Any) -> Any:
    assert x is None
    return x


def from_union(fs, x):
    for f in fs:
        try:
            return f(x)
        except:
            pass
    assert False


def to_class(c: Type[T], x: Any) -> dict:
    assert isinstance(x, c)
    return cast(Any, x).to_dict()


def from_datetime(x: Any) -> Optional[datetime]:
    if x != None:
        return dateutil.parser.parse(x)
    return x


def to_enum(c: Type[EnumT], x: Any) -> EnumT:
    assert isinstance(x, c)
    return x.value


def from_list(f: Callable[[Any], T], x: Any) -> List[T]:
    assert isinstance(x, list)
    return [f(y) for y in x]


def from_int(x: Any) -> int:
    assert isinstance(x, int) and not isinstance(x, bool)
    return x


class B1:
    data_available: bool
    network_daily_price: str
    basic_meter_daily_price: str
    additional_smart_meter_daily_price: str
    amber_daily_price: str
    total_daily_price: str
    network_kwh_price: Optional[str]
    market_kwh_price: str
    green_kwh_price: str
    carbon_neutral_kwh_price: str
    loss_factor: str
    offset_kwh_price: str
    totalfixed_kwh_price: str
    total_black_peak_fixed_kwh_price: str
    total_black_shoulder_fixed_kwh_price: str
    total_black_offpeak_fixed_kwh_price: str
    network_peak_kwh_price: Optional[str]
    network_shoulder_kwh_price: Optional[str]
    network_offpeak_kwh_price: Optional[str]

    def __init__(
        self,
        data_available: bool,
        network_daily_price: str,
        basic_meter_daily_price: str,
        additional_smart_meter_daily_price: str,
        amber_daily_price: str,
        total_daily_price: str,
        network_kwh_price: Optional[str],
        market_kwh_price: str,
        green_kwh_price: str,
        carbon_neutral_kwh_price: str,
        loss_factor: str,
        offset_kwh_price: str,
        totalfixed_kwh_price: str,
        total_black_peak_fixed_kwh_price: str,
        total_black_shoulder_fixed_kwh_price: str,
        total_black_offpeak_fixed_kwh_price: str,
        network_peak_kwh_price: Optional[str],
        network_shoulder_kwh_price: Optional[str],
        network_offpeak_kwh_price: Optional[str],
    ) -> None:
        self.data_available = data_available
        self.network_daily_price = network_daily_price
        self.basic_meter_daily_price = basic_meter_daily_price
        self.additional_smart_meter_daily_price = additional_smart_meter_daily_price
        self.amber_daily_price = amber_daily_price
        self.total_daily_price = total_daily_price
        self.network_kwh_price = network_kwh_price
        self.market_kwh_price = market_kwh_price
        self.green_kwh_price = green_kwh_price
        self.carbon_neutral_kwh_price = carbon_neutral_kwh_price
        self.loss_factor = loss_factor
        self.offset_kwh_price = offset_kwh_price
        self.totalfixed_kwh_price = totalfixed_kwh_price
        self.total_black_peak_fixed_kwh_price = total_black_peak_fixed_kwh_price
        self.total_black_shoulder_fixed_kwh_price = total_black_shoulder_fixed_kwh_price
        self.total_black_offpeak_fixed_kwh_price = total_black_offpeak_fixed_kwh_price
        self.network_peak_kwh_price = network_peak_kwh_price
        self.network_shoulder_kwh_price = network_shoulder_kwh_price
        self.network_offpeak_kwh_price = network_offpeak_kwh_price

    @staticmethod
    def from_dict(obj: Any) -> "B1":
        assert isinstance(obj, dict)
        data_available = from_bool(obj.get("dataAvailable"))
        network_daily_price = from_str(obj.get("networkDailyPrice"))
        basic_meter_daily_price = from_str(obj.get("basicMeterDailyPrice"))
        additional_smart_meter_daily_price = from_str(
            obj.get("additionalSmartMeterDailyPrice")
        )
        amber_daily_price = from_str(obj.get("amberDailyPrice"))
        total_daily_price = from_str(obj.get("totalDailyPrice"))
        network_kwh_price = from_union(
            [from_str, from_none], obj.get("networkKWHPrice")
        )
        market_kwh_price = from_str(obj.get("marketKWHPrice"))
        green_kwh_price = from_str(obj.get("greenKWHPrice"))
        carbon_neutral_kwh_price = from_str(obj.get("carbonNeutralKWHPrice"))
        loss_factor = from_str(obj.get("lossFactor"))
        offset_kwh_price = from_str(obj.get("offsetKWHPrice"))
        totalfixed_kwh_price = from_str(obj.get("totalfixedKWHPrice"))
        total_black_peak_fixed_kwh_price = from_str(
            obj.get("totalBlackPeakFixedKWHPrice")
        )
        total_black_shoulder_fixed_kwh_price = from_str(
            obj.get("totalBlackShoulderFixedKWHPrice")
        )
        total_black_offpeak_fixed_kwh_price = from_str(
            obj.get("totalBlackOffpeakFixedKWHPrice")
        )
        network_peak_kwh_price = from_union(
            [from_str, from_none], obj.get("networkPeakKWHPrice")
        )
        network_shoulder_kwh_price = from_union(
            [from_str, from_none], obj.get("networkShoulderKWHPrice")
        )
        network_offpeak_kwh_price = from_union(
            [from_str, from_none], obj.get("networkOffpeakKWHPrice")
        )
        return B1(
            data_available,
            network_daily_price,
            basic_meter_daily_price,
            additional_smart_meter_daily_price,
            amber_daily_price,
            total_daily_price,
            network_kwh_price,
            market_kwh_price,
            green_kwh_price,
            carbon_neutral_kwh_price,
            loss_factor,
            offset_kwh_price,
            totalfixed_kwh_price,
            total_black_peak_fixed_kwh_price,
            total_black_shoulder_fixed_kwh_price,
            total_black_offpeak_fixed_kwh_price,
            network_peak_kwh_price,
            network_shoulder_kwh_price,
            network_offpeak_kwh_price,
        )

    def to_dict(self) -> dict:
        result: dict = {}
        result["dataAvailable"] = from_bool(self.data_available)
        result["networkDailyPrice"] = from_str(self.network_daily_price)
        result["basicMeterDailyPrice"] = from_str(self.basic_meter_daily_price)
        result["additionalSmartMeterDailyPrice"] = from_str(
            self.additional_smart_meter_daily_price
        )
        result["amberDailyPrice"] = from_str(self.amber_daily_price)
        result["totalDailyPrice"] = from_str(self.total_daily_price)
        result["networkKWHPrice"] = from_union(
            [from_str, from_none], self.network_kwh_price
        )
        result["marketKWHPrice"] = from_str(self.market_kwh_price)
        result["greenKWHPrice"] = from_str(self.green_kwh_price)
        result["carbonNeutralKWHPrice"] = from_str(self.carbon_neutral_kwh_price)
        result["lossFactor"] = from_str(self.loss_factor)
        result["offsetKWHPrice"] = from_str(self.offset_kwh_price)
        result["totalfixedKWHPrice"] = from_str(self.totalfixed_kwh_price)
        result["totalBlackPeakFixedKWHPrice"] = from_str(
            self.total_black_peak_fixed_kwh_price
        )
        result["totalBlackShoulderFixedKWHPrice"] = from_str(
            self.total_black_shoulder_fixed_kwh_price
        )
        result["totalBlackOffpeakFixedKWHPrice"] = from_str(
            self.total_black_offpeak_fixed_kwh_price
        )
        result["networkPeakKWHPrice"] = from_union(
            [from_str, from_none], self.network_peak_kwh_price
        )
        result["networkShoulderKWHPrice"] = from_union(
            [from_str, from_none], self.network_shoulder_kwh_price
        )
        result["networkOffpeakKWHPrice"] = from_union(
            [from_str, from_none], self.network_offpeak_kwh_price
        )
        return result


class StaticPrices:
    e1: B1
    e2: B1
    b1: B1
    e1_tou: B1

    def __init__(self, e1: B1, e2: B1, b1: B1, e1_tou: B1) -> None:
        self.e1 = e1
        self.e2 = e2
        self.b1 = b1
        self.e1_tou = e1_tou

    @staticmethod
    def from_dict(obj: Any) -> "StaticPrices":
        assert isinstance(obj, dict)
        E1 = None
        if(obj.get("E1")):
            e1 = B1.from_dict(obj.get("E1"))
        E2 = None
        if(obj.get("E2")):
            e2 = B1.from_dict(obj.get("E2"))
        b1 = None
        if(obj.get("B1")):
            b1 = B1.from_dict(obj.get("B1"))
        e1_tou = None
        if(obj.get("E1TOU")):
            e1_tou = B1.from_dict(obj.get("E1TOU"))
        return StaticPrices(e1, e2, b1, e1_tou)

    def to_dict(self) -> dict:
        result: dict = {}
        result["E1"] = to_class(B1, self.e1)
        result["E2"] = to_class(B1, self.e2)
        result["B1"] = to_class(B1, self.b1)
        result["E1TOU"] = to_class(B1, self.e1_tou)
        return result


class PeriodSource(Enum):
    THE_30_MIN = "30MIN"
    THE_5_MIN = "5MIN"


class PeriodType(Enum):
    ACTUAL = "ACTUAL"
    FORECAST = "FORECAST"

class VariablePricesAndRenewable:
    period_type: PeriodType
    created_at: datetime
    wholesale_kwh_price: str
    usage: Optional[str]
    region: str
    period: datetime
    renewables_percentage: str
    period_source: PeriodSource
    percentile_rank: str
    latest_period: Optional[datetime]
    forecasted_at: Optional[datetime]
    forecasted_at_period: Optional[str]

    def __init__(
        self,
        period_type: PeriodType,
        created_at: datetime,
        wholesale_kwh_price: str,
        usage: Optional[str],
        region: str,
        period: datetime,
        renewables_percentage: str,
        period_source: PeriodSource,
        percentile_rank: str,
        latest_period: Optional[datetime],
        forecasted_at: Optional[datetime],
        forecasted_at_period: Optional[str],
    ) -> None:
        self.period_type = period_type
        self.created_at = created_at
        self.wholesale_kwh_price = wholesale_kwh_price
        self.usage = usage
        self.region = region
        self.period = period
        self.renewables_percentage = renewables_percentage
        self.period_source = period_source
        self.percentile_rank = percentile_rank
        self.latest_period = latest_period
        self.forecasted_at = forecasted_at
        self.forecasted_at_period = forecasted_at_period

    @staticmethod
    def from_dict(obj: Any) -> "VariablePricesAndRenewable":
        assert isinstance(obj, dict)
        period_type = PeriodType(obj.get("periodType"))
        if obj.get("createdAt") == None:
            created_at = ""
        else:
            created_at = from_datetime(obj.get("createdAt"))
        wholesale_kwh_price = from_str(obj.get("wholesaleKWHPrice"))
        usage = from_union([from_str, from_none], obj.get("usage"))
        region = from_str(obj.get("region"))
        period = from_datetime(obj.get("period"))
        renewables_percentage = from_str(obj.get("renewablesPercentage"))
        period_source = PeriodSource(obj.get("periodSource"))
        percentile_rank = from_str(obj.get("percentileRank"))
        latest_period = from_union([from_datetime, from_none], obj.get("latestPeriod"))
        forecasted_at = from_union([from_datetime, from_none], obj.get("forecastedAt"))
        forecasted_at_period = from_union(
            [from_str, from_none], obj.get("forecastedAt+period")
        )
        return VariablePricesAndRenewable(
            period_type,
            created_at,
            wholesale_kwh_price,
            usage,
            region,
            period,
            renewables_percentage,
            period_source,
            percentile_rank,
            latest_period,
            forecasted_at,
            forecasted_at_period,
        )

    def to_dict(self) -> dict:
        result: dict = {}
        result["periodType"] = to_enum(PeriodType, self.period_type)
        result["createdAt"] = self.created_at.isoformat()
        result["wholesaleKWHPrice"] = from_str(self.wholesale_kwh_price)
        result["usage"] = from_union([from_str, from_none], self.usage)
        result["region"] = to_enum(Region, self.region)
        result["period"] = self.period.isoformat()
        result["renewablesPercentage"] = from_str(self.renewables_percentage)
        result["periodSource"] = to_enum(PeriodSource, self.period_source)
        result["percentileRank"] = from_str(self.percentile_rank)
        result["latestPeriod"] = from_union(
            [lambda x: x.isoformat(), from_none], self.latest_period
        )
        result["forecastedAt"] = from_union(
            [lambda x: x.isoformat(), from_none], self.forecasted_at
        )
        result["forecastedAt+period"] = from_union(
            [from_str, from_none], self.forecasted_at_period
        )
        return result


class Data:
    current_ne_mtime: datetime
    postcode: int
    network_provider: str
    static_prices: StaticPrices
    variable_prices_and_renewables: List[VariablePricesAndRenewable]

    def __init__(
        self,
        current_ne_mtime: datetime,
        postcode: int,
        network_provider: str,
        static_prices: StaticPrices,
        variable_prices_and_renewables: List[VariablePricesAndRenewable],
    ) -> None:
        self.current_ne_mtime = current_ne_mtime
        self.postcode = postcode
        self.network_provider = network_provider
        self.static_prices = static_prices
        self.variable_prices_and_renewables = variable_prices_and_renewables

    @staticmethod
    def from_dict(obj: Any) -> "Data":
        assert isinstance(obj, dict)
        print(obj.get("currentNEMtime"))
        current_ne_mtime = from_datetime(obj.get("currentNEMtime"))
        postcode = int(from_str(obj.get("postcode")))
        network_provider = from_str(obj.get("networkProvider"))
        static_prices = StaticPrices.from_dict(obj.get("staticPrices"))
        variable_prices_and_renewables = from_list(
            VariablePricesAndRenewable.from_dict, obj.get("variablePricesAndRenewables")
        )
        return Data(
            current_ne_mtime,
            postcode,
            network_provider,
            static_prices,
            variable_prices_and_renewables,
        )

    def to_dict(self) -> dict:
        result: dict = {}
        result["currentNEMtime"] = self.current_ne_mtime.isoformat()
        result["postcode"] = from_str(str(self.postcode))
        result["networkProvider"] = from_str(self.network_provider)
        result["staticPrices"] = to_class(StaticPrices, self.static_prices)
        result["variablePricesAndRenewables"] = from_list(
            lambda x: to_class(VariablePricesAndRenewable, x),
            self.variable_prices_and_renewables,
        )
        return result


class AmberData:
    service_response_type: int
    data: Data
    message: str

    def __init__(self, service_response_type: int, data: Data, message: str) -> None:
        self.service_response_type = service_response_type
        self.data = data
        self.message = message

    @staticmethod
    def from_dict(obj: Any) -> "AmberData":
        assert isinstance(obj, dict)
        service_response_type = from_int(obj.get("serviceResponseType"))
        data = Data.from_dict(obj.get("data"))
        message = from_str(obj.get("message"))
        return AmberData(service_response_type, data, message)

    def to_dict(self) -> dict:
        result: dict = {}
        result["serviceResponseType"] = from_int(self.service_response_type)
        result["data"] = to_class(Data, self.data)
        result["message"] = from_str(self.message)
        return result


def amberdata_from_dict(s: Any) -> AmberData:
    return AmberData.from_dict(s)


def amberdata_to_dict(x: AmberData) -> Any:
    return to_class(AmberData, x)
