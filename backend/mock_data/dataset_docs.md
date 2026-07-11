# StadiumMind AI Simulation Dataset Documentation

This directory contains the mock datasets and active simulation engines for **StadiumMind AI**, modeling a live match day at a 82,500 capacity venue (representing MetLife Stadium, New Jersey).

---

## 📊 Dataset Structure & Models

The simulator manages 17 modular datasets representing various operations:

### 1. Spectators (80,000 Capacity)
- **Active Size**: 80,000 spectators.
- **Distribution Model**:
  - **Transit**: 5% on walking routes, 15% in parking lots, 10% in metro/bus queues.
  - **Gates**: 15% entering or queuing at entrances G1-G4.
  - **Concourse**: 20% walking or ordering at concessions/food courts.
  - **Seated**: 35% in sections.

### 2. Entrances (G1 to G4)
- **Fields**: `gate_id`, `name`, `current_count`, `density_percentage`, `status` (`low` | `moderate` | `busy` | `congested`), `queue_length`.
- **Update Frequency**: Every 2 seconds.

### 3. Parking Lots (Lot A, B, C)
- **Fields**: `name`, `capacity`, `occupied`, `status`.
- **Metrics**: Lot occupancy increases before kickoff, decreases during match close.

### 4. Food Courts (Stalls F1, F2, F3)
- **Fields**: `stall_id`, `name`, `queue_length`, `wait_time_minutes`, `inventory_percentage`, `status` (`normal` | `low`).
- **Dynamics**: Inventory drops dynamically relative to transactions; queue lengths fluctuate.

### 5. Volunteers (V-101 to V-104)
- **Fields**: `volunteer_id`, `name`, `status` (`available` | `responding` | `break`), `location`, `current_assignment`.

### 6. Medical Teams (MED-UNIT-1)
- **Fields**: `team_id`, `name`, `status`, `location`, `current_cases`, `ambulances_available`, `treatment_room_status`.

### 7. Security Patrols
- **Fields**: `patrol_id`, `officers_count`, `location`, `status`, `restricted_zones_cleared`.

### 8. Weather Monitoring
- **Fields**: `temperature_c`, `humidity_pct`, `status` (`sunny` | `cloudy` | `rain` | `storm`).

### 9. Transportation Networks
- **Fields**: `metro_status`, `bus_queue`, `taxi_delay_min`, `walking_routes_clear`.

### 10. Incidents Log (Lost Children, Medical Alerts, Emergencies)
- **Fields**: `incident_id`, `type`, `location`, `severity`, `status`, `assigned_team`, `estimated_resolution_min`, `ai_recommendation`.

---

## ⚡ Dynamic Simulation Control

The `StadiumSimulator` class supports:
- **State Persistence**: Persisted state as a singleton.
- **Simulation Speed**: Multiplier (`speed_multiplier`) to speed up or slow down operations (e.g. `1.0` for real-time, `10.0` or `60.0` for fast-forwarding).
- **Incident Engine**: Automatically creates, updates, and resolves incidents (lost children, medical calls) over simulated time.
- **AI Summary Generator**: Invokes the Gemini API or a rule-based engine to generate executive reports and risk summaries of the active simulation data.
