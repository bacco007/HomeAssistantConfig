import appdaemon.plugins.hass.hassapi as hass
import requests
import json


# Check Home Assistant Configuration

class CheckConfig(hass.Hass):

	def initialize(self):
		# is auto-restart set?
		if "restart" in self.args and self.args["restart"] == False:
			self.restart = False
		else:
			self.restart = True

		# is folder watcher set?
		if "folder_watcher" in self.args and self.args["folder_watcher"] == True:
			self.folder_watcher = True
			self.throttle_timer = None
		else:
			self.folder_watcher = False

		# create a sensor to track check result
		self.set_state("sensor.config_result", state="-", attributes = {"friendly_name": "Config Result", "detail": None})
		
		# get HASS URL
		self.apiurl = "{}/api/config/core/check_config".format(self.config["plugins"]["HASS"]["ha_url"])
		
		# token or key to authenticate
		if "token" in self.config["plugins"]["HASS"]:
			self.auth = "token"
			if self.folder_watcher == False:
				self.listen_state(self.check_config, "script.check_config", attribute="last_triggered")
			else:
				self.listen_event(self.config_throttle, "folder_watcher", file="configuration.yaml")
		elif "ha_key" in self.config["plugins"]["HASS"]:
			self.auth = "key"
			if self.folder_watcher == False:
				self.listen_state(self.check_config, "script.check_config", attribute="last_triggered")
			else:
				self.listen_event(self.config_throttle, "folder_watcher", file="configuration.yaml")
		else:
			self.log("AppDaemon config must use a token or key to authenticate with HASS")
			self.set_state("sensor.config_result", state="ERROR", attributes = {"friendly_name": "Config Result", "detail": "AppDaemon config must use a token or key to authenticate with HASS"})
		
	def check_config(self, entity, attribute, old, new, kwargs):
		# reset sensor while check is in progress
		self.set_state("sensor.config_result", state="checking", attributes = {"detail": None})
		# set headers for auth
		if self.auth == "token":
			self.headers = {'Authorization': "Bearer {}".format(self.config["plugins"]["HASS"]["token"])}
		else: #key
			self.headers = {'x-ha-access': self.config["plugins"]["HASS"]["ha_key"]}
		# make the request
		r = requests.post(self.apiurl, headers=self.headers)
		# evaluate result
		if json.loads(r.text)['result'] == "valid":
			self.set_state("sensor.config_result", state="valid", attributes = {"detail": None})
			# restart if auto-restart is on
			if self.restart == True:
				self.call_service("homeassistant/restart")
		else:
			self.set_state("sensor.config_result", state="invalid", attributes = {"detail": json.loads(r.text)['errors']})
			
	def config_throttle(self, event_name, data, kwargs):
		#throttle function to ensure that we don't call check multiple times
		self.cancel_timer(self.throttle_timer)
		self.throttle_timer = self.run_in(self.auto_check_config, 3)

	def auto_check_config(self, kwargs):
		# reset sensor while check is in progress
		self.set_state("sensor.config_result", state="checking", attributes = {"detail": None})
		# set headers for auth
		if self.auth == "token":
			self.headers = {'Authorization': "Bearer {}".format(self.config["plugins"]["HASS"]["token"])}
		else: #key
			self.headers = {'x-ha-access': self.config["plugins"]["HASS"]["ha_key"]}
		# make the request
		r = requests.post(self.apiurl, headers=self.headers)
		# evaluate result
		if json.loads(r.text)['result'] == "valid":
			self.set_state("sensor.config_result", state="valid", attributes = {"detail": None})
			# restart if auto-restart is on
			if self.restart == True:
				self.call_service("homeassistant/restart")
		else:
			self.set_state("sensor.config_result", state="invalid", attributes = {"detail": json.loads(r.text)['errors']})