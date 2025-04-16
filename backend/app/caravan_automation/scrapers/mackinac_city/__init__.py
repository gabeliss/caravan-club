"""
Mackinac City scrapers package.

This package contains web scrapers for campgrounds in the Mackinac City area.
"""

from .scrapeStIgnaceKoa import scrape_stIgnaceKoa_api
from .scrapeIndianRiver import scrape_indianRiver_api


__all__ = [
    'scrape_stIgnaceKoa_api',
    'scrape_indianRiver_api'
] 