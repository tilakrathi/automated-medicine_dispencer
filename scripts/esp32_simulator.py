#!/usr/bin/env python3
"""
ESP32 Device Simulator for Smart Medicine Dispenser
Simulates the ESP32 device communication with the web app backend
"""

import requests
import json
import time
import random
from datetime import datetime, timedelta
import schedule

# Configuration
API_BASE_URL = "http://localhost:3000/api"
DEVICE_ID = "ESP32_001"
SYNC_INTERVAL = 300  # 5 minutes

class ESP32Simulator:
    def __init__(self):
        self.device_id = DEVICE_ID
        self.battery_level = 100
        self.schedules = []
        self.last_sync = None
        
    def log(self, message):
        """Log message with timestamp"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"[{timestamp}] ESP32 Simulator: {message}")
        
    def send_status_update(self):
        """Send device status to backend"""
        try:
            # Simulate battery drain
            self.battery_level = max(0, self.battery_level - random.uniform(0.1, 0.5))
            
            status_data = {
                "deviceId": self.device_id,
                "batteryLevel": round(self.battery_level, 1),
                "wifiSignal": random.randint(-60, -30),
                "temperature": round(random.uniform(20, 30), 1),
                "humidity": random.randint(40, 60),
                "currentSlot": None,
                "errors": []
            }
            
            response = requests.post(
                f"{API_BASE_URL}/device/status",
                json=status_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                self.log(f"Status update sent - Battery: {self.battery_level}%")
            else:
                self.log(f"Failed to send status update: {response.status_code}")
                
        except Exception as e:
            self.log(f"Error sending status update: {e}")
    
    def sync_schedules(self):
        """Sync schedules from backend"""
        try:
            sync_data = {"deviceId": self.device_id}
            
            response = requests.post(
                f"{API_BASE_URL}/device/sync",
                json=sync_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                self.schedules = data.get("schedules", [])
                self.last_sync = datetime.now()
                self.log(f"Synced {len(self.schedules)} schedules")
                
                # Print schedule details
                for schedule in self.schedules:
                    self.log(f"  Slot {schedule['slot_number']}: {schedule['medicine_name']} at {', '.join(schedule['times'])}")
            else:
                self.log(f"Failed to sync schedules: {response.status_code}")
                
        except Exception as e:
            self.log(f"Error syncing schedules: {e}")
    
    def check_scheduled_medications(self):
        """Check if any medications should be dispensed now"""
        if not self.schedules:
            return
            
        current_time = datetime.now().strftime("%H:%M")
        
        for schedule in self.schedules:
            for scheduled_time in schedule['times']:
                # Check if current time matches scheduled time (within 1 minute)
                scheduled_dt = datetime.strptime(scheduled_time, "%H:%M")
                current_dt = datetime.strptime(current_time, "%H:%M")
                
                time_diff = abs((current_dt - scheduled_dt).total_seconds())
                
                if time_diff <= 60:  # Within 1 minute
                    self.dispense_medication(schedule, scheduled_time)
    
    def dispense_medication(self, schedule, scheduled_time):
        """Simulate medication dispensing"""
        try:
            slot_number = schedule['slot_number']
            medicine_name = schedule['medicine_name']
            dosage = schedule['dosage']
            
            self.log(f"Dispensing {medicine_name} from slot {slot_number}")
            
            # Simulate dispensing delay
            time.sleep(2)
            
            # Simulate success/failure (95% success rate)
            success = random.random() < 0.95
            actual_time = datetime.now().strftime("%H:%M")
            
            if success:
                # Simulate patient acknowledgment (80% chance)
                acknowledged = random.random() < 0.8
                status = "taken" if acknowledged else "taken"  # Assume taken if dispensed
                
                # Determine if late (more than 5 minutes after scheduled)
                scheduled_dt = datetime.strptime(scheduled_time, "%H:%M")
                actual_dt = datetime.strptime(actual_time, "%H:%M")
                minutes_late = (actual_dt - scheduled_dt).total_seconds() / 60
                
                if minutes_late > 5:
                    status = "late"
                
                self.log(f"Successfully dispensed {medicine_name} - Status: {status}")
                
            else:
                status = "missed"
                acknowledged = False
                actual_time = None
                self.log(f"Failed to dispense {medicine_name} - Status: {status}")
            
            # Send log to backend
            log_data = {
                "medicineName": medicine_name,
                "dosage": dosage,
                "scheduledTime": scheduled_time,
                "actualTime": actual_time,
                "slotNumber": slot_number,
                "status": status,
                "acknowledged": acknowledged,
                "deviceId": self.device_id,
                "notes": f"Automatically dispensed by device" if success else "Dispense mechanism failed"
            }
            
            response = requests.post(
                f"{API_BASE_URL}/logs",
                json=log_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                self.log(f"Log entry created for {medicine_name}")
            else:
                self.log(f"Failed to create log entry: {response.status_code}")
                
        except Exception as e:
            self.log(f"Error dispensing medication: {e}")
    
    def run_simulation(self):
        """Main simulation loop"""
        self.log("Starting ESP32 Device Simulator")
        self.log(f"Device ID: {self.device_id}")
        
        # Initial sync
        self.sync_schedules()
        self.send_status_update()
        
        # Schedule periodic tasks
        schedule.every(5).minutes.do(self.sync_schedules)
        schedule.every(2).minutes.do(self.send_status_update)
        schedule.every(1).minutes.do(self.check_scheduled_medications)
        
        # Main loop
        try:
            while True:
                schedule.run_pending()
                time.sleep(10)  # Check every 10 seconds
                
        except KeyboardInterrupt:
            self.log("Simulation stopped by user")
        except Exception as e:
            self.log(f"Simulation error: {e}")

if __name__ == "__main__":
    simulator = ESP32Simulator()
    simulator.run_simulation()
