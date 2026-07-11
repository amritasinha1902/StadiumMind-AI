import time
import random
from datetime import datetime, timedelta
from typing import Dict, Any, List

class StadiumSimulator:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(StadiumSimulator, cls).__new__(cls, *args, **kwargs)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self) -> None:
        if self._initialized:
            return
        self._initialized = True
        
        # Clock & Speed
        self.start_time = datetime.utcnow()
        self.sim_time = self.start_time
        self.speed_multiplier = 5.0  # 1s real = 5s sim
        self.last_update_real = time.time()
        
        # Spectators
        self.spectator_capacity = 82500
        self.occupancy_percentage = 90.9
        self.current_occupancy = int(self.spectator_capacity * (self.occupancy_percentage / 100))
        
        # Weather
        self.weather = {
            "temperature_c": 24.5,
            "humidity_pct": 62.0,
            "status": "sunny"
        }
        
        # Gates
        self.entrances = {
            "G1": {"name": "Gate 1 (West Entrance)", "current_count": 8200, "density_percentage": 42.0, "status": "low", "queue_length": 15},
            "G2": {"name": "Gate 2 (South Entrance)", "current_count": 14500, "density_percentage": 73.0, "status": "busy", "queue_length": 45},
            "G3": {"name": "Gate 3 (North Entrance)", "current_count": 19200, "density_percentage": 94.0, "status": "congested", "queue_length": 110},
            "G4": {"name": "Gate 4 (East Entrance)", "current_count": 9800, "density_percentage": 55.0, "status": "moderate", "queue_length": 25}
        }
        
        # Concessions
        self.food_stalls = {
            "F1": {"name": "Stadium Grill A", "queue_length": 15, "wait_time_minutes": 10, "inventory_percentage": 82.0, "status": "normal"},
            "F2": {"name": "Taco Corner B", "queue_length": 42, "wait_time_minutes": 25, "inventory_percentage": 23.0, "status": "low"},
            "F3": {"name": "Beverage Stand C", "queue_length": 6, "wait_time_minutes": 3, "inventory_percentage": 94.0, "status": "normal"}
        }
        
        # Volunteers
        self.volunteers = [
            {"volunteer_id": "V-101", "name": "David Kim", "status": "available", "location": "Gate 2 Information Desk", "assignment": None},
            {"volunteer_id": "V-102", "name": "Elena Rostova", "status": "responding", "location": "Concourse Sector C", "assignment": "INC-402"},
            {"volunteer_id": "V-103", "name": "Carlos Gomez", "status": "available", "location": "North Entrance Lobby", "assignment": None},
            {"volunteer_id": "V-104", "name": "Sofia Alvarez", "status": "break", "location": "Staff Lounge Section D", "assignment": None}
        ]
        
        # Medical & Security Teams
        self.medical = {
            "team_id": "MED-UNIT-1",
            "name": "Medical Unit Central",
            "status": "treating_patient",
            "location": "First Aid Station 1",
            "current_cases": 3,
            "ambulances_available": 2,
            "treatment_room_status": "Normal flow. 1 bed occupied."
        }
        self.security = {
            "patrol_id": "PATROL-A",
            "officers_count": 6,
            "location": "Gate 3 Perimeter",
            "status": "patrolling",
            "restricted_zones_cleared": True
        }
        
        # Transit
        self.transit = {
            "metro_status": "normal",
            "bus_queue": 120,
            "taxi_delay_min": 15,
            "walking_routes_clear": True,
            "metro_info": "Trains operating every 3 minutes. Platform 1 slightly crowded.",
            "shuttle_info": "Shuttle buses delayed by 8 minutes due to outer loop traffic.",
            "taxi_info": "High demand taxi queue. Average wait time: 18 minutes.",
            "parking_info": "Lot A and Lot B are 95% full. Lot C has 200 available slots.",
            "walking_info": "Sensors record clear, safe walking paths across all exits."
        }
        
        # Parking Lots
        self.parking = {
            "Lot A": {"capacity": 5000, "occupied": 4800, "status": "normal"},
            "Lot B": {"capacity": 4000, "occupied": 3850, "status": "normal"},
            "Lot C": {"capacity": 3000, "occupied": 2100, "status": "normal"}
        }
        
        # Accessibility requests
        self.accessibility = {
            "wheelchair_escorts_active": 14,
            "hearing_loops_active": 8,
            "visual_reader_sessions": 3
        }

        # Sustainability
        self.sustainability = {
            "water_usage_liters": 4500.0,
            "energy_usage_kwh": 1250.0,
            "waste_recycled_kg": 240.0
        }

        # Incidents
        self.incidents = [
            {
                "incident_id": "INC-402",
                "type": "lost_child",
                "location": "Kids Zone Concourse A",
                "severity": "medium",
                "status": "active",
                "assigned_team": "Volunteer Elena Rostova",
                "estimated_resolution_min": 15,
                "ai_recommendation": "Dispatch Volunteer Elena Rostova. Announce child name subtly via zone speakers."
            },
            {
                "incident_id": "INC-501",
                "type": "medical",
                "location": "Section 104 Walkway",
                "severity": "high",
                "status": "responding",
                "assigned_team": "Medical Team 1",
                "estimated_resolution_min": 8,
                "ai_recommendation": "Direct Medical Team 1 to Section 104 with AED kit. Mobilize backup stretcher."
            }
        ]
        
        # Logs
        self.logs = [
            {"timestamp": self.sim_time.isoformat(), "level": "INFO", "message": "Stadium doors opened. Welcome fans!"},
            {"timestamp": self.sim_time.isoformat(), "level": "WARN", "message": "High density recorded at North Entrance Gate 3."}
        ]

    def set_speed(self, multiplier: float) -> None:
        self.speed_multiplier = multiplier

    def update(self) -> None:
        """Triggered periodically to update simulation fields based on elapsed time."""
        now = time.time()
        elapsed_real = now - self.last_update_real
        self.last_update_real = now
        
        sim_delta_sec = elapsed_real * self.speed_multiplier
        self.sim_time += timedelta(seconds=sim_delta_sec)

        # 1. Update occupancy
        self.current_occupancy = min(self.spectator_capacity, max(5000, self.current_occupancy + random.randint(-50, 80)))
        self.occupancy_percentage = round((self.current_occupancy / self.spectator_capacity) * 100, 1)

        # 2. Update Weather
        self.weather["temperature_c"] = round(self.weather["temperature_c"] + random.choice([-0.1, 0, 0.1]), 1)
        self.weather["humidity_pct"] = min(100.0, max(20.0, self.weather["humidity_pct"] + random.choice([-1, 0, 1])))

        # 3. Update Gates
        for g_id, gate in self.entrances.items():
            delta = random.randint(-200, 250)
            gate["current_count"] = max(100, gate["current_count"] + delta)
            density = min(100.0, max(5.0, gate["density_percentage"] + (delta / 200.0)))
            gate["density_percentage"] = round(density, 1)
            gate["queue_length"] = max(1, int(gate["density_percentage"] * 1.1))
            if gate["density_percentage"] >= 90:
                gate["status"] = "congested"
            elif gate["density_percentage"] >= 70:
                gate["status"] = "busy"
            elif gate["density_percentage"] >= 40:
                gate["status"] = "moderate"
            else:
                gate["status"] = "low"

        # 4. Update Concessions
        for f_id, stall in self.food_stalls.items():
            stall["queue_length"] = max(2, stall["queue_length"] + random.choice([-2, -1, 0, 1, 2]))
            stall["wait_time_minutes"] = max(1, int(stall["queue_length"] * 0.6))
            stall["inventory_percentage"] = round(max(5.0, stall["inventory_percentage"] - (random.uniform(0.005, 0.015) * sim_delta_sec)), 1)
            if stall["inventory_percentage"] < 30:
                stall["status"] = "low"
            else:
                stall["status"] = "normal"

        # 5. Update Transit
        self.transit["bus_queue"] = max(10, self.transit["bus_queue"] + random.choice([-10, -5, 0, 5, 10, 15]))
        self.transit["taxi_delay_min"] = max(2, self.transit["taxi_delay_min"] + random.choice([-2, -1, 0, 1, 2]))
        
        # 6. Update Accessibility escorts
        self.accessibility["wheelchair_escorts_active"] = max(1, self.accessibility["wheelchair_escorts_active"] + random.choice([-1, 0, 1]))

        # 6.5 Update Sustainability stats
        self.sustainability["water_usage_liters"] += random.uniform(5.0, 15.0) * (self.current_occupancy / 80000.0) * (sim_delta_sec / 10.0)
        self.sustainability["energy_usage_kwh"] += random.uniform(1.0, 3.0) * (self.current_occupancy / 80000.0) * (sim_delta_sec / 10.0)
        self.sustainability["waste_recycled_kg"] += random.uniform(0.5, 1.5) * (self.current_occupancy / 80000.0) * (sim_delta_sec / 10.0)

        self.sustainability["water_usage_liters"] = round(self.sustainability["water_usage_liters"], 1)
        self.sustainability["energy_usage_kwh"] = round(self.sustainability["energy_usage_kwh"], 1)
        self.sustainability["waste_recycled_kg"] = round(self.sustainability["waste_recycled_kg"], 1)

        # 7. Random Incidents generator
        if random.random() < 0.02 * (sim_delta_sec / 10.0):
            inc_type = random.choice(["lost_child", "medical", "restroom_leak", "gate_scuffle"])
            inc_id = f"INC-{random.randint(600, 999)}"
            locations = ["Section 102", "Concourse Section C", "Gate 1 Parking", "Kids Zone", "Section 124"]
            loc = random.choice(locations)
            severity = random.choice(["low", "medium", "high"])
            
            recs = {
                "lost_child": "Deploy volunteer near zone. Inform announcer.",
                "medical": "Dispatch medical patrol. Carry medical bag.",
                "restroom_leak": "Notify venue cleanup staff. Barricade section.",
                "gate_scuffle": "Deploy nearby security officers. Call command desk."
            }
            
            new_inc = {
                "incident_id": inc_id,
                "type": inc_type,
                "location": loc,
                "severity": severity,
                "status": "active",
                "assigned_team": "Pending Dispatch",
                "estimated_resolution_min": random.randint(5, 30),
                "ai_recommendation": recs[inc_type]
            }
            self.incidents.append(new_inc)
            self.logs.append({
                "timestamp": self.sim_time.isoformat(),
                "level": "WARN" if severity != "high" else "ERROR",
                "message": f"New incident reported: {inc_type} at {loc}."
            })

        # 8. Progress active incidents towards resolution
        for inc in self.incidents:
            if inc["status"] == "active" and random.random() < 0.05 * (sim_delta_sec / 10.0):
                inc["status"] = "responding"
                if inc["type"] == "medical":
                    inc["assigned_team"] = "Medical Team 1"
                else:
                    idle_vols = [v for v in self.volunteers if v["status"] == "available"]
                    if idle_vols:
                        chosen = random.choice(idle_vols)
                        chosen["status"] = "responding"
                        chosen["assignment"] = inc["incident_id"]
                        inc["assigned_team"] = f"Volunteer {chosen['name']}"
            elif inc["status"] == "responding" and random.random() < 0.03 * (sim_delta_sec / 10.0):
                inc["status"] = "resolved"
                for v in self.volunteers:
                    if v["assignment"] == inc["incident_id"]:
                        v["status"] = "available"
                        v["assignment"] = None
                self.logs.append({
                    "timestamp": self.sim_time.isoformat(),
                    "level": "INFO",
                    "message": f"Incident {inc['incident_id']} ({inc['type']}) resolved."
                })

        # Keep incident list at reasonable size
        if len(self.incidents) > 20:
            self.incidents = [i for i in self.incidents if i["status"] != "resolved"]
