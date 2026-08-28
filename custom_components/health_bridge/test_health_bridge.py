#!/usr/bin/env python3
"""
Health Bridge Test Script

This script sends test data to your Health Bridge webhook to verify the integration is working.
"""

import argparse
import json
import random
import time
from datetime import datetime
import requests

def generate_test_data(user_id):
    """Generate random health data for testing."""
    now = datetime.now().isoformat()
    
    return {
        "token": TOKEN,
        "user_id": user_id,
        "data": {
            "steps": [{"timestamp": now, "value": random.randint(5000, 15000)}],
            "heart_rate": [{"timestamp": now, "value": random.randint(60, 90)}],
            "active_calories": [{"timestamp": now, "value": random.randint(200, 600)}],
            "resting_heart_rate": [{"timestamp": now, "value": random.randint(55, 75)}],
            "sleep_duration": [{"timestamp": now, "value": round(random.uniform(6.0, 9.0), 1)}],
            "distance": [{"timestamp": now, "value": round(random.uniform(2.0, 10.0), 1) * 1000}],  # in meters
            "oxygen_saturation": [{"timestamp": now, "value": random.randint(95, 100)}],
            "respiratory_rate": [{"timestamp": now, "value": random.randint(12, 20)}],
            "body_mass": [{"timestamp": now, "value": round(random.uniform(60.0, 85.0), 1)}],
            "body_fat_percentage": [{"timestamp": now, "value": round(random.uniform(10.0, 25.0), 1)}]
        }
    }

def test_connection():
    """Send a test connection request."""
    data = {
        "token": TOKEN,
        "user_id": "test_user",
        "data": {
            "test_connection": [{"value": True}]
        }
    }
    
    try:
        print(f"Sending test connection to {WEBHOOK_URL}...")
        response = requests.post(WEBHOOK_URL, json=data)
        print(f"Response status: {response.status_code}")
        if response.status_code == 200:
            print("Test connection successful! Check your Home Assistant notifications.")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Connection error: {e}")

def send_test_data(user_id, continuous=False, interval=60):
    """Send test health data to the webhook."""
    try:
        if continuous:
            print(f"Sending continuous test data for user '{user_id}' every {interval} seconds. Press Ctrl+C to stop.")
            while True:
                data = generate_test_data(user_id)
                response = requests.post(WEBHOOK_URL, json=data)
                print(f"[{datetime.now().strftime('%H:%M:%S')}] Data sent. Response: {response.status_code}")
                time.sleep(interval)
        else:
            data = generate_test_data(user_id)
            print(f"Sending test data for user '{user_id}' to {WEBHOOK_URL}...")
            print(f"Test data (summary):")
            for metric, values in data["data"].items():
                print(f"  - {metric}: {values[0]['value']}")
                
            response = requests.post(WEBHOOK_URL, json=data)
            print(f"Response status: {response.status_code}")
            if response.status_code == 200:
                print("Test data sent successfully! Check your Home Assistant for the new entities.")
            else:
                print(f"Error: {response.text}")
    except KeyboardInterrupt:
        print("\nTest stopped by user.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Test Health Bridge integration")
    parser.add_argument("webhook_url", help="Your Health Bridge webhook URL")
    parser.add_argument("token", help="Your Health Bridge security token")
    parser.add_argument("--user", "-u", default="test_user", help="User ID to use in test data")
    parser.add_argument("--continuous", "-c", action="store_true", help="Continuously send data")
    parser.add_argument("--interval", "-i", type=int, default=60, help="Interval in seconds (for continuous mode)")
    parser.add_argument("--test-connection", "-t", action="store_true", help="Only test the connection")
    
    args = parser.parse_args()
    
    WEBHOOK_URL = args.webhook_url
    TOKEN = args.token
    
    if args.test_connection:
        test_connection()
    else:
        send_test_data(args.user, args.continuous, args.interval)