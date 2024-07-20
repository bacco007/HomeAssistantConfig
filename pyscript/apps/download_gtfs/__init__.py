import datetime, os, shutil, requests

@pyscript_executor
def download_file(url, apikey, folder_name, local_filename):
    try:
        #local_filename = url.split('/')[-1]
        path = os.path.join("/{}/{}".format(folder_name, local_filename))
        headers = { 'accept' : 'application/octet-stream',
                    'Authorization': apikey}
        with requests.get(url, stream=True, headers=headers) as r:
            with open(path, 'wb') as f:
                f.write(r.content)
        return local_filename, None
    except Exception as exc:
        return None, exc

@service
def download_gtfs(url=None, filename=None):
    """yaml
    name: Download GTFS
    description: Download GTFS from TfNSW
    fields:
        url:
            name: URL
            description: TfNSW API URL
            example: https://api.transport.nsw.gov.au/v1/gtfs/schedule/regionbuses/newenglandnorthwest
            required: true
            selector:
                text:
        filename:
            name: File Name
            description: Name for Downloaded file
            example: tfnsw.zip
            required: true
            selector:
                text:"""
    if url is None:
        log.error('No URL Provided')
        return

    location = "/config/gtfs2/"
    apikey = "apikey " + get_config("apikey")

    # log.error(url)
    # log.error(apikey)
    # log.error(filename)

    filepath = location + filename
    # log.error(filepath)

    r, exception = download_file(url, apikey, location, filename)
    if exception:
        raise exception

def get_config(name):
    value = pyscript.app_config.get(name)
    if value is None:
        log.error('"' + name + '" is required by not defined in Pyscript config')
    return value

@time_trigger("startup")
def load():
    log.error(f"app has started")
    get_config("apikey")
