
from .const             import (EVLOG_ALERT, EVLOG_NOTICE,
                                CRLF, CRLF_CHK, CRLF_SP3_STAR, CRLF_INDENT,
                                CRLF_DOT, CRLF_SP3_DOT, CRLF_SP5_DOT, CRLF_HDOT,
                                CRLF_RED_X, RED_X, CRLF_STAR, CRLF_DASH_75,
                                RARROW,NBSP3, NBSP4, NBSP6, CIRCLE_STAR, INFO_SEPARATOR,
                                DASH_20, CHECK_MARK, )

more_info_text = {
    'iosapp_device_not_found': (
        f"{CRLF_DASH_75}"
        f"{CRLF}1. Check the mobile_app devices in HA Settings > Devices & "
        f"Services > Devices to see if it is listed."
        f"{CRLF}2. Check the iOSApp on the device that was not found to make "
        f"sure it is operational and can communicate with HA. Refresh its location "
        f"by pulling down  On the screen."
        f"{CRLF}3. Check the iOSApp device_tracker entities on HA Settings > "
        f"Developer Tools >  States to verify are the devices using the iOS App are "
        f"listed and the data is current."
        f"{CRLF}4. Check the iOSApp Device Entity assigned to the iCloud3 device "
        f"on the iCloud3 `Configure Settings > Update Devices` screen. Make sure the "
        f"name is correct and has not been changed."),

    'iosapp_device_not_found_on_scan': (
        f"{CRLF_DASH_75}"
        f"{CRLF}1. Check the iOSApp Device Entity assigned to the iCloud3 device "
        f"on the iCloud3 `Configure Settings > Update Devices` screen. Change the "
        f"iOS App device_tracker entity from `Scan for mobile_app device_tracker` "
        f"to a specific device_tracker entity."
        f"{CRLF}2. Check the mobile_app devices in HA Settings > Devices & "
        f"Services > Devices and delete or rename the devices starting with the "
        f"iCloud3 devicename that should be selected."),

    'iosapp_multiple_devices_on_scan': (
        f"{CRLF_DASH_75}"
        f"{CRLF}1. Check the iOSApp Device Entity assigned to the iCloud3 device "
        f"on the iCloud3 ``Configure Settings > Update Devices` screen. Change the "
        f"iOS App device_tracker entity from `Scan for mobile_app device_tracker` "
        f"to a specific device_tracker entity."
        f"{CRLF}2. Check the mobile_app devices in HA Settings > Devices & "
        f"Services > Devices and delete or rename the devices starting with the "
        f"iCloud3 devicename that should not be selected."),

    'famshr_device_not_available': (
        f"{CRLF_DASH_75}"
        f"{CRLF}1. Check the Family Share devices in the FindMy app on your phone. "
        f"See if any devices are missing or there is more than one device with the same name."
        f"{CRLF}2. Have you change phones? The FamShr devicename in Configure Settings "
        f"may be the old phone, not the new phone. The new one may have a different name."
        f"{CRLF}3. Check the FamShr devices in Stage 4 above. It lists all the FamShr devices that "
        f"have been returned from your Apple iCloud account. Sometimes, Apple does not return "
        f"all of the devices if there is a delay locating it or it is asleep. iCloud3 will "
        f"request the list 2-times. Open the missing device so it is available, then restart "
        f"iCloud3 to see if it is found."
        f"{CRLF}4. Check the FamShr Device assigned to the iCloud3 device "
        f"on the iCloud3 `Configure Settings > Update Devices` screen. Open the FamShr Devices "
        f"list and review the devicenames available. Make sure the devices are correct and "
        f"there are no duplicates or additional/new devices with a different name."),

    'refresh_browser': (
        f"{CRLF_DOT}Refresh your browser (Chrome, MacOS, Edge):"
        f"{CRLF}{NBSP3}1. Press Ctrl+Shift+Del, Clear Data, Refresh"
        f"{CRLF}{NBSP3}2. On Settings tab, check Clear Images and File, then Click Clear Data, Refresh"
        f"{CRLF}{NBSP3}3. Select the Home Assistant tab, then Refresh the display"
        f"{CRLF_DOT}Refresh the iOS App on iPhones, iPads, etc:"
        f"{CRLF}{NBSP3}1. HA Sidebar, Configuration, Companion App"
        f"{CRLF}{NBSP3}2. Debugging, Reset frontend cache, Settings, Done"
        f"{CRLF}{NBSP3}3. Close Companion App, Redisplay iCloud3 screen"
        f"{CRLF}{NBSP3}4. Refresh, Pull down from the top, Spinning wheel, Done"),

    'unverified_device': (
        f"{CRLF_DASH_75}"
        f"{CRLF}This can be caused by:"
        f"{CRLF}1. iCloud3 Device configuration error. Check the iCloud3 `Configure Settings > "
        f"Update Devices` screen and verify the FamShr and iOS App Device selections are correct."
        f"{CRLF_DOT}2. No iCloud or iOS App device have been selected. See #1 above."
        f"{CRLF_DOT}3. This device is no longer in your iCloud Family Sharring device list. Review "
        f"the devices in the FindMy app on your phone and on your iCloud account. Review the list of "
        f"devices returned from your iCloud account when iCloud3 was starting up in the Event Log Stage 4."
        f"{CRLF_DOT}4. iCloud or iOS App are not being used to locate devices. Verify that your iCloud "
        f"access is set up on the `Configure Settings > iCloud Account` screen. Also verify that FamShr "
        f"devices have been assigned to iCloud3 devices `Configure Settings Update Devices` screen."
        f"{CRLF_DOT}5. iCloud is down. The network is down. iCloud is not responding to location requests."
        f"{CRLF_DOT}6. An internal code error occurred. Check HA Settings > System > Logs for errors."
        f"{CRLF_DASH_75}"
        f"{CRLF}Restart iCloud3 (Event Log > Actions > Restart iCloud) and see if the problem reoccurs."),

    'all_devices_inactive': (
        f"Devices can be tracked, monitored or inactive on the iCloud3 `Configure Settings > Update "
        f"Devices` screen. In this case, all of the devices are set to an Inactive status.  "
        f"{CRLF}1. Change the `Tracking Mode` from INACTIVE to Track or Monitor."
        f"{CRLF}2. Verify the Family Share (FamShr) Device assigned to the iCloud3 device."
        f"{CRLF}3. Verify the iOS App Device assigned to the iCloud3 device."
        f"{CRLF}4. Review the other parameters for the device while you are on this screen."
        f"{CRLF}5. Do this for all of your devices."
        f"{CRLF}6. Exit the iCloud3 `Configure Settings` screens and Restart iCloud3."),

    'invalid_msg_key': (
        f"{CRLF_DASH_75}"
        f"{CRLF}Information is not available for "),
}
