import datetime, os, shutil, requests

@pyscript_executor
def download_file(url, folder_name, local_filename):
    try:
        #local_filename = url.split('/')[-1]
        path = os.path.join("/{}/{}".format(folder_name, local_filename))
        headers = { 'Accept-Language' : 'en-US,en;q=0.9',
                    'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'}
        with requests.get(url, stream=True, headers=headers) as r:
            with open(path, 'wb') as f:
                f.write(r.content)
        return local_filename, None
    except Exception as exc:
        return None, exc

@service
def download_xmltv(url=None, filename=None, statussensor=None, sensorname=None):

    if url is None:
        log.error('No URL Provided')
        return

    location = "/config/xmltv/"

    log.error(url)
    log.error(statussensor)
    log.error(sensorname)
    log.error(filename)

    filepath = location + filename
    log.error(filepath)

    r, exception = download_file(url, location, filename)
    if exception:
        raise exception
        status = "Bad"
        dltime = None
    else:
        status = "Good"
        dltime = datetime.datetime.now()

    attributes = {}
    attributes["icon"] = "mdi:download"
    attributes["friendly_name"] = "TV Guide - XMLTV Data Download Status - " + sensorname
    attributes["downloadtime"] = dltime
    state.set(statussensor, value=status, new_attributes = attributes)


def get_config(name):
    value = pyscript.app_config.get(name)
    if value is None:
        log.error('"' + name + '" is required by not defined in Pyscript config')
    return value

@time_trigger("startup")
def load():
    log.error(f"app has started")
