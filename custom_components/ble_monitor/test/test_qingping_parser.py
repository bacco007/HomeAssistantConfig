"""The tests for the Qingping ble_parser."""
from ble_monitor.ble_parser import BleParser


class TestQingping:
    """Tests for the Qingping parser"""
    def test_qingping_CGP1W(self):
        """Test Qingping parser for CGP1W."""
        data_string = "043E28020100006F1C40342D581C0201061816CDFD08096F1C40342D580104BE000D0207027226020157D1"
        data = bytes(bytearray.fromhex(data_string))
        # pylint: disable=unused-variable
        ble_parser = BleParser()
        sensor_msg, tracker_msg = ble_parser.parse_raw_data(data)

        assert sensor_msg["firmware"] == "Qingping"
        assert sensor_msg["type"] == "CGP1W"
        assert sensor_msg["mac"] == "582D34401C6F"
        assert sensor_msg["packet"] == "no packet id"
        assert sensor_msg["data"]
        assert sensor_msg["temperature"] == 19.0
        assert sensor_msg["humidity"] == 52.5
        assert sensor_msg["pressure"] == 984.2
        assert sensor_msg["battery"] == 87
        assert sensor_msg["rssi"] == -47

    def test_qingping_CGD1(self):
        """Test Qingping parser for CGD1."""
        data_string = "043E2402010000BF6552342D58180201061416CDFD080CBF6552342D580104F100AD01020125D1"
        data = bytes(bytearray.fromhex(data_string))
        # pylint: disable=unused-variable
        ble_parser = BleParser()
        sensor_msg, tracker_msg = ble_parser.parse_raw_data(data)

        assert sensor_msg["firmware"] == "Qingping"
        assert sensor_msg["type"] == "CGD1"
        assert sensor_msg["mac"] == "582D345265BF"
        assert sensor_msg["packet"] == "no packet id"
        assert sensor_msg["data"]
        assert sensor_msg["temperature"] == 24.1
        assert sensor_msg["humidity"] == 42.9
        assert sensor_msg["battery"] == 37
        assert sensor_msg["rssi"] == -47

    def test_qingping_CGG1(self):
        """Test Qingping parser for CGG1."""
        data_string = "043E2402010000B24410342D58180201061416CDFD0807B24410342D580104CA004502020138AF"
        data = bytes(bytearray.fromhex(data_string))
        # pylint: disable=unused-variable
        ble_parser = BleParser()
        sensor_msg, tracker_msg = ble_parser.parse_raw_data(data)

        assert sensor_msg["firmware"] == "Qingping"
        assert sensor_msg["type"] == "CGG1"
        assert sensor_msg["mac"] == "582D341044B2"
        assert sensor_msg["packet"] == "no packet id"
        assert sensor_msg["data"]
        assert sensor_msg["temperature"] == 20.2
        assert sensor_msg["humidity"] == 58.1
        assert sensor_msg["battery"] == 56
        assert sensor_msg["rssi"] == -81

    def test_qingping_CGP22C(self):
        """Test Qingping parser for CGP22C."""
        data_string = "043E2802010000c11b86342d581C0201061816cdfd0a5dc11b86342d580104ff00af0102016413024702D1"

        data = bytes(bytearray.fromhex(data_string))
        # pylint: disable=unused-variable
        ble_parser = BleParser()
        sensor_msg, tracker_msg = ble_parser.parse_raw_data(data)

        assert sensor_msg["firmware"] == "Qingping"
        assert sensor_msg["type"] == "CGP22C"
        assert sensor_msg["mac"] == "582D34861BC1"
        assert sensor_msg["packet"] == "no packet id"
        assert sensor_msg["data"]
        assert sensor_msg["temperature"] == 25.5
        assert sensor_msg["humidity"] == 43.1
        assert sensor_msg["battery"] == 100
        assert sensor_msg["co2"] == 583
        assert sensor_msg["rssi"] == -47

    def test_qingping_CGP23W(self):
        """Test Qingping parser for CGP23W."""
        data_string = "043E2802010000072240342d581C0201061816cdfd8818072240342d5801041701ca0002016107027227D1"
        data = bytes(bytearray.fromhex(data_string))
        # pylint: disable=unused-variable
        ble_parser = BleParser()
        sensor_msg, tracker_msg = ble_parser.parse_raw_data(data)

        assert sensor_msg["firmware"] == "Qingping"
        assert sensor_msg["type"] == "CGP23W"
        assert sensor_msg["mac"] == "582D34402207"
        assert sensor_msg["packet"] == "no packet id"
        assert sensor_msg["data"]
        assert sensor_msg["temperature"] == 27.9
        assert sensor_msg["humidity"] == 20.2
        assert sensor_msg["battery"] == 97
        assert sensor_msg["pressure"] == 1009.8
        assert sensor_msg["rssi"] == -47

    def test_qingping_CGPR1_1(self):
        """Test Qingping parser for CGPR1 (illuminance)."""
        data_string = "043E2702010000005E60342D581B0201061716CDFD0812005E60342D580201640F011C09048B090000AF"
        data = bytes(bytearray.fromhex(data_string))
        # pylint: disable=unused-variable
        ble_parser = BleParser()
        sensor_msg, tracker_msg = ble_parser.parse_raw_data(data)

        assert sensor_msg["firmware"] == "Qingping"
        assert sensor_msg["type"] == "CGPR1"
        assert sensor_msg["mac"] == "582D34605E00"
        assert sensor_msg["packet"] == 28
        assert sensor_msg["data"]
        assert sensor_msg["illuminance"] == 2443
        assert sensor_msg["battery"] == 100
        assert sensor_msg["rssi"] == -81

    def test_qingping_CGPR1_2(self):
        """Test Qingping parser for CGPR1 (illuminance + motion)."""
        data_string = "043E2402010000005E60342D58180201061416CDFD4812005E60342D580804008B09000F0122AF"
        data = bytes(bytearray.fromhex(data_string))
        # pylint: disable=unused-variable
        ble_parser = BleParser()
        sensor_msg, tracker_msg = ble_parser.parse_raw_data(data)

        assert sensor_msg["firmware"] == "Qingping"
        assert sensor_msg["type"] == "CGPR1"
        assert sensor_msg["mac"] == "582D34605E00"
        assert sensor_msg["packet"] == 34
        assert sensor_msg["data"]
        assert sensor_msg["illuminance"] == 2443
        assert sensor_msg["motion"] == 0
        assert sensor_msg["rssi"] == -81

    def test_qingping_CGPR1_3(self):
        """Test Qingping parser for CGPR1 (light)."""
        data_string = "043E2102010000005E60342D58150201061116CDFD4812005E60342D581101010F0130AF"
        data = bytes(bytearray.fromhex(data_string))
        # pylint: disable=unused-variable
        ble_parser = BleParser()
        sensor_msg, tracker_msg = ble_parser.parse_raw_data(data)

        assert sensor_msg["firmware"] == "Qingping"
        assert sensor_msg["type"] == "CGPR1"
        assert sensor_msg["mac"] == "582D34605E00"
        assert sensor_msg["packet"] == 48
        assert sensor_msg["data"]
        assert sensor_msg["light"] == 1
        assert sensor_msg["rssi"] == -81

    def test_qingping_no_data(self):
        """Test Qingping parser with message with no data."""
        data_string = "043E1F020100000CA4288CCF04130201060B16CDFD080E0AA4288CCF048CCF0481CB"
        data = bytes(bytearray.fromhex(data_string))
        # pylint: disable=unused-variable
        ble_parser = BleParser()
        sensor_msg, tracker_msg = ble_parser.parse_raw_data(data)

        assert sensor_msg is None

    def test_qingping_CGDN1(self):
        """Test Qingping parser for CGDN1."""
        data_string = "043E2B02010000A5808FE648541F0201061B16CDFD080EA3808FE64854010422014C011204710072001302ED03CC"
        data = bytes(bytearray.fromhex(data_string))
        # pylint: disable=unused-variable
        ble_parser = BleParser()
        sensor_msg, tracker_msg = ble_parser.parse_raw_data(data)

        assert sensor_msg["firmware"] == "Qingping"
        assert sensor_msg["type"] == "CGDN1"
        assert sensor_msg["mac"] == "5448E68F80A5"
        assert sensor_msg["packet"] == "no packet id"
        assert sensor_msg["data"]
        assert sensor_msg["temperature"] == 29.0
        assert sensor_msg["humidity"] == 33.2
        assert sensor_msg["co2"] == 1005
        assert sensor_msg["pm2.5"] == 113
        assert sensor_msg["pm10"] == 114
        assert sensor_msg["rssi"] == -52

    def test_qingping_CGDN1(self):
        """Test Qingping parser for CGDN1."""
        data_string = "043e2b02010201da060f38c1a41f0201061b16cdfd0824b6ebc994c27c0104d100ba0112040a000a0013026f02cc"
        data = bytes(bytearray.fromhex(data_string))
        # pylint: disable=unused-variable
        ble_parser = BleParser()
        sensor_msg, tracker_msg = ble_parser.parse_raw_data(data)

        assert sensor_msg["firmware"] == "Qingping"
        assert sensor_msg["type"] == "CGDN1"
        assert sensor_msg["mac"] == "A4C1380F06DA"
        assert sensor_msg["packet"] == "no packet id"
        assert sensor_msg["data"]
        assert sensor_msg["temperature"] == 20.9
        assert sensor_msg["humidity"] == 44.2
        assert sensor_msg["co2"] == 623
        assert sensor_msg["pm2.5"] == 10
        assert sensor_msg["pm10"] == 10
        assert sensor_msg["rssi"] == -52
