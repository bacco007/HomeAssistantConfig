"""Weather analysis modules.

This package contains modular components for weather analysis:
- core: Core weather condition determination
- atmospheric: Pressure and fog analysis
- solar: Solar radiation and cloud cover analysis
- trends: Historical data trends and patterns

All functionality is re-exported through the main WeatherAnalysis class
for backward compatibility.
"""

from .atmospheric import AtmosphericAnalyzer
from .core import WeatherConditionAnalyzer
from .solar import SolarAnalyzer
from .trends import TrendsAnalyzer

__all__ = [
    "WeatherConditionAnalyzer",
    "AtmosphericAnalyzer",
    "SolarAnalyzer",
    "TrendsAnalyzer",
]
