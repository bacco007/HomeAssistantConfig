"""Constants for the MyJDownloader integration."""

DOMAIN = "myjdownloader"
TITLE = "MyJDownloader"

SCAN_INTERVAL_SECONDS = 60

LATEST_VERSION_SCAN_INTERVAL_SECONDS = 24 * 3600  # disabled, if <= 0
LATEST_VERSION_URL = "https://svn.jdownloader.org/build.php"
LATEST_VERSION_REGEX = (
    r".*LatestRevision:[^\d+]+(\d+)[^\d+]+Date:[^\d+]+<[^>]+>([^<]+).*"
)

ATTR_LINKS = "links"
ATTR_PACKAGES = "packages"

MYJDAPI_APP_KEY = "https://git.io/JO0Dh"

DATA_MYJDOWNLOADER_CLIENT = "myjdownloader_client"

SERVICE_RESTART_AND_UPDATE = "restart_and_update"
SERVICE_RUN_UPDATE_CHECK = "run_update_check"
SERVICE_START_DOWNLOADS = "start_downloads"
SERVICE_STOP_DOWNLOADS = "stop_downloads"
SERVICE_ADD_LINKS = "add_links"

FIELD_LINKS = "links"
FIELD_PRIORITY = "priority"
FIELD_AUTOSTART = "auto_extract"
FIELD_AUTO_EXTRACT = "autostart"
FIELD_PACKAGE_NAME = "package_name"
FIELD_EXTRACT_PASSWORD = "extract_password"
FIELD_DOWNLOAD_PASSWORD = "download_password"
FIELD_DESTINATION_FOLDER = "destination_folder"
FIELD_OVERWRITE_PACKAGIZER_RULES = "overwrite_packagizer_rules"
