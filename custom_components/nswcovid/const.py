"""Constants used by NSW Covid components."""
from __future__ import annotations

from typing import Final

DOMAIN: Final = "nswcovid"

INTEGRATION_VERSION: Final = "v0.0.13"

NSWHEALTH_HOST: Final = "www.health.nsw.gov.au"
NSWHEALTH_PATH: Final = "Infectious/covid-19/Pages/stats-nsw.aspx"

NSWHEALTH_NAME: Final = "Covid NSW"

NSWHEALTH_UPDATE: Final = f"{DOMAIN}_tracker_update"

ATTR_PUBLISHED: Final = "published"
ATTR_LOCALLY_ACTIVE: Final = "locally_active"
ATTR_INTERSTATE_ACTIVE: Final = "interstate_active"
ATTR_OVERSEAS_ACTIVE: Final = "overseas_active"
ATTR_TOTAL_ACTIVE: Final = "total_active"
ATTR_LAST_24_HOURS_KNOWN: Final = "last_24_hours_known"
ATTR_LAST_24_HOURS_UNKNOWN: Final = "last_24_hours_unknown"
ATTR_LAST_24_HOURS_INTERSTATE: Final = "last_24_hours_interstate"
ATTR_LAST_24_HOURS_OVERSEAS: Final = "last_24_hours_overseas"
ATTR_LAST_24_HOURS_TOTAL: Final = "last_24_hours_total"
ATTR_LAST_24_HOURS_TESTS: Final = "last_24_hours_tests"
ATTR_THIS_WEEK_KNOWN: Final = "this_week_known"
ATTR_THIS_WEEK_UNKNOWN: Final = "this_week_unknown"
ATTR_THIS_WEEK_INTERSTATE: Final = "this_week_interstate"
ATTR_THIS_WEEK_OVERSEAS: Final = "this_week_overseas"
ATTR_THIS_WEEK_TOTAL: Final = "this_week_total"
ATTR_THIS_WEEK_TESTS: Final = "this_week_tests"
ATTR_LAST_WEEK_KNOWN: Final = "last_week_known"
ATTR_LAST_WEEK_UNKNOWN: Final = "last_week_unknown"
ATTR_LAST_WEEK_INTERSTATE: Final = "last_week_interstate"
ATTR_LAST_WEEK_OVERSEAS: Final = "last_week_overseas"
ATTR_LAST_WEEK_TOTAL: Final = "last_week_total"
ATTR_LAST_WEEK_TESTS: Final = "last_week_tests"
ATTR_THIS_YEAR_KNOWN: Final = "this_year_known"
ATTR_THIS_YEAR_UNKNOWN: Final = "this_year_unknown"
ATTR_THIS_YEAR_INTERSTATE: Final = "this_year_interstate"
ATTR_THIS_YEAR_OVERSEAS: Final = "this_year_overseas"
ATTR_THIS_YEAR_TOTAL: Final = "this_year_total"
ATTR_THIS_YEAR_TESTS: Final = "this_year_tests"
ATTR_LAST_24_HOURS_FIRST_DOSE: Final = "last_24_hours_first_dose"
ATTR_LAST_24_HOURS_SECOND_DOSE: Final = "last_24_hours_second_dose"
ATTR_LAST_24_HOURS_TOTAL_DOSE: Final = "last_24_hours_total_dose"
ATTR_TOTAL_FIRST_DOSE: Final = "total_first_dose"
ATTR_TOTAL_SECOND_DOSE: Final = "total_second_dose"
ATTR_TOTAL_TOTAL_DOSE: Final = "total_total_dose"

DEVICE_CLASS_COVID_CASES: Final = "covid_cases"
DEVICE_CLASS_COVID_VACCINATIONS: Final = "covid_vaccinations"

MANUFACTURER: Final = "NSW Health"
