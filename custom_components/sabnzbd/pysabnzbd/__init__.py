from aiohttp import ClientError, ClientSession, ClientTimeout
import asyncio


class SabnzbdApi(object):
    def __init__(self, base_url, api_key, web_root=None,
                 session=None, timeout=5):
        """Initialize the connection to the SABnzbd usenet client"""
        if web_root is not None:
            web_root = '{}/'.format(web_root.strip('/'))
        else:
            web_root = ''

        self.queue = {}
        self._api_url = '{}/{}{}'.format(base_url.rstrip('/'), web_root, 'api')
        self._default_params = {'apikey': api_key, 'output': 'json'}
        self._timeout = timeout

        if session is None:
            self._session = ClientSession()
            self._cleanup_session = True
        else:
            self._session = session
            self._cleanup_session = False

    def __del__(self):
        """Cleanup the session if it was created here"""
        if self._cleanup_session:
            self._session.loop.run_until_complete(self._session.close())

    async def _call(self, params):
        """Call the SABnzbd API"""
        if self._session.closed:
            raise SabnzbdApiException('Session already closed')

        p = {**self._default_params, **params}
        try:
            resp = await self._session.get(
                self._api_url,
                params=p,
                timeout=ClientTimeout(self._timeout)
            )
            data = await resp.json()
            if data.get('status', True) is False:
                self._handle_error(data, params)
            else:
                return data
        except ClientError:
            raise SabnzbdApiException('Unable to communicate with Sabnzbd API')
        except asyncio.TimeoutError:
            raise SabnzbdApiException('SABnzbd API request timed out')

    async def refresh_data(self):
        """Refresh the cached SABnzbd queue data"""
        queue = await self.get_queue()
        history = await self.get_history()
        totals = {}
        for k in history:
            if k[-4:] == 'size':
                totals[k] = self._convert_size(history.get(k))
        self.queue = {**totals, **queue}

    async def get_history(self):
        """Fetch the SABnzbd history stats"""
        params = {'mode': 'history', 'limit': 1}
        history = await self._call(params)
        return history.get('history')

    async def get_queue(self):
        """Fetch the SABnzbd queue stats"""
        params = {'mode': 'queue', 'start': '0', 'limit': '10'}
        queue = await self._call(params)
        return queue.get('queue')

    async def pause_queue(self):
        """Pause the SABnzbd client"""
        params = {'mode': 'pause'}
        await self._call(params)

    async def resume_queue(self):
        """Resume the SABnzbd client"""
        params = {'mode': 'resume'}
        await self._call(params)

    async def set_speed_limit(self, speed=100):
        """Set the download speed limit of the SABnzbd client"""
        params = {'mode': 'config', 'name': 'speedlimit', 'value': speed}
        await self._call(params)

    async def check_available(self):
        """Test the connection to the SABnzbd client"""
        params = {'mode': 'queue'}
        await self._call(params)
        return True

    def _convert_size(self, size_str):
        """Convert units to GB"""
        suffix = size_str[-1]
        if suffix == 'K':
            multiplier = 1.0 / (1024.0 * 1024.0)
        elif suffix == 'M':
            multiplier = 1.0 / 1024.0
        elif suffix == 'T':
            multiplier = 1024.0
        else:
            multiplier = 1

        try:
            val = float(size_str.split(' ')[0])
            return val * multiplier
        except ValueError:
            return 0.0

    def _handle_error(self, data, params):
        """Handle an error response from the SABnzbd API"""
        error = data.get('error', 'API call failed')
        mode = params.get('mode')
        raise SabnzbdApiException(error, mode=mode)


class SabnzbdApiException(Exception):
    """Base exception class for all SABnzbd API errors"""
    def __init__(self, message, mode=None):
        self.message = message
        self.mode = mode

    def __str__(self):
        if self.mode is not None:
            msg_format = '{}: calling api endpoint \'{}\''
        else:
            msg_format = '{}'
        return msg_format.format(self.message,
                                 self.mode if self.mode is not None else '')