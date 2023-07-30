"""Profile helper for MastodonProfileStats."""

from urllib.parse import urlparse


class MastodonProfile:
    """MastodonProfileStats Profile helper class."""

    def __init__(self, any_profile: str) -> None:
        """Initialize the profile class using either the url or full profile name."""
        if self.url_validator(any_profile):
            self.profile_url = any_profile
        else:
            components = any_profile.split("@")
            if len(components) == 3:
                self.profile_url = f"https://{components[2]}/@{components[1]}"

    def url_validator(self, url_to_validate) -> bool:
        """Is the value a url."""
        try:
            result = urlparse(url_to_validate)
            return all([result.scheme, result.netloc])
        except ValueError:
            return False

    @property
    def native_value(self) -> str:
        """Return the native value of the profile."""
        return self.profile_url

    @property
    def apiurl(self) -> str:
        """Return the api url for profile."""

        # https://mastodon.online/@codechimp
        # https://mastodon.online/api/v1/accounts/lookup?acct=codechimp

        url_components = urlparse(self.profile_url)
        api = (
            url_components.scheme
            + "://"
            + url_components.netloc
            + "/api/v1/accounts/lookup?acct="
            + url_components.path[2:]
        )

        return api

    @property
    def profile_name(self) -> str:
        """Return the profile name."""

        # https://mastodon.online/@codechimp = codechimp

        url_components = urlparse(self.profile_url)
        profile = url_components.path[2:]

        return profile

    @property
    def full_profile_name(self) -> str:
        """Return the full profile name."""

        # https://mastodon.online/@codechimp = @codechimp@mastodon.online

        url_components = urlparse(self.profile_url)
        profile = url_components.path[1:]
        instance = url_components.netloc

        return profile + "@" + instance
