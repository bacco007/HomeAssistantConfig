from pytrends.request import TrendReq
from typing import List

def get_top_trends(country_code, count=5):
    pytrends = TrendReq(hl=country_code, tz=360)
    trending_searches_df = pytrends.trending_searches(pn=country_code)
    return trending_searches_df[0].head(count).tolist()