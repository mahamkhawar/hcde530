import os
import requests
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("API_KEY")
BASE_URL = "https://api.purpleair.com/v1"
HEADERS = {"X-API-Key": API_KEY}


def check_key():
    r = requests.get(f"{BASE_URL}/keys", headers=HEADERS)
    r.raise_for_status()
    return r.json()


def get_sensors(fields, max_age=3600, location_type=0, nwlng=None, nwlat=None, selng=None, selat=None):
    """Fetch sensor list. location_type: 0=outdoor, 1=indoor."""
    params = {
        "fields": ",".join(fields),
        "max_age": max_age,
        "location_type": location_type,
    }
    if all(v is not None for v in [nwlng, nwlat, selng, selat]):
        params.update({"nwlng": nwlng, "nwlat": nwlat, "selng": selng, "selat": selat})

    r = requests.get(f"{BASE_URL}/sensors", headers=HEADERS, params=params)
    r.raise_for_status()
    data = r.json()
    df = pd.DataFrame(data["data"], columns=data["fields"])
    return df


def get_sensor(sensor_index, fields=None):
    params = {}
    if fields:
        params["fields"] = ",".join(fields)
    r = requests.get(f"{BASE_URL}/sensors/{sensor_index}", headers=HEADERS, params=params)
    r.raise_for_status()
    return r.json()


def get_sensor_history(sensor_index, days=7, average=60, fields=None):
    """Fetch historical readings for one sensor.

    average: averaging period in minutes — 0 (raw), 10, 30, 60, 360, 1440
    """
    if fields is None:
        fields = ["pm2.5_atm", "pm1.0_atm", "pm10.0_atm", "temperature", "humidity"]

    now = datetime.now(timezone.utc)
    params = {
        "start_timestamp": int((now - timedelta(days=days)).timestamp()),
        "end_timestamp": int(now.timestamp()),
        "average": average,
        "fields": ",".join(fields),
    }
    r = requests.get(f"{BASE_URL}/sensors/{sensor_index}/history", headers=HEADERS, params=params)
    r.raise_for_status()
    data = r.json()
    df = pd.DataFrame(data["data"], columns=data["fields"])
    df["time_stamp"] = pd.to_datetime(df["time_stamp"], unit="s", utc=True)
    df = df.sort_values("time_stamp").reset_index(drop=True)
    return df


def plot_sensor_history(df, sensor_name, out_path="sensor_history.png"):
    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 7), sharex=True)

    ax1.plot(df["time_stamp"], df["pm2.5_atm"], label="PM2.5", color="steelblue")
    if "pm1.0_atm" in df.columns:
        ax1.plot(df["time_stamp"], df["pm1.0_atm"], label="PM1.0", color="seagreen", alpha=0.7)
    if "pm10.0_atm" in df.columns:
        ax1.plot(df["time_stamp"], df["pm10.0_atm"], label="PM10.0", color="tomato", alpha=0.7)
    ax1.set_ylabel("µg/m³")
    ax1.set_title(f"{sensor_name} — Particulate Matter (7-day, 60-min avg)")
    ax1.legend()
    ax1.grid(True, alpha=0.3)

    ax2.plot(df["time_stamp"], df["temperature"], label="Temp (°F)", color="orange")
    ax2.set_ylabel("°F", color="orange")
    ax2_r = ax2.twinx()
    ax2_r.plot(df["time_stamp"], df["humidity"], label="Humidity (%)", color="cornflowerblue", linestyle="--")
    ax2_r.set_ylabel("Humidity %", color="cornflowerblue")
    ax2.set_title("Temperature & Humidity")
    ax2.grid(True, alpha=0.3)
    ax2.xaxis.set_major_formatter(mdates.DateFormatter("%m/%d %H:%M"))
    fig.autofmt_xdate()

    lines1, labels1 = ax2.get_legend_handles_labels()
    lines2, labels2 = ax2_r.get_legend_handles_labels()
    ax2.legend(lines1 + lines2, labels1 + labels2)

    plt.tight_layout()
    plt.savefig(out_path, dpi=150)
    print(f"Plot saved to {out_path}")
    plt.close()


if __name__ == "__main__":
    # 1. Verify API key
    print("=== API Key Info ===")
    key_info = check_key()
    print(key_info)

    # 2. Core fields available from PurpleAir
    fields = [
        "name", "latitude", "longitude", "altitude",
        "pm2.5", "pm2.5_10minute", "pm2.5_60minute", "pm2.5_24hour",
        "temperature", "humidity", "pressure",
        "last_seen", "uptime", "rssi",
    ]

    # 3. Fetch outdoor sensors near Seattle (UW area bounding box)
    print("\n=== Sensors near Seattle (outdoor) ===")
    df = get_sensors(
        fields=fields,
        nwlng=-122.45, nwlat=47.70,
        selng=-122.25, selat=47.55,
    )
    print(f"Found {len(df)} sensors")
    print(df.head(10).to_string())

    # 4. Summary stats on PM2.5
    print("\n=== PM2.5 Summary Stats ===")
    pm_cols = ["pm2.5", "pm2.5_10minute", "pm2.5_60minute", "pm2.5_24hour"]
    print(df[pm_cols].describe())

    # 5. Fetch a single sensor for full detail
    if not df.empty:
        sample_idx = int(df["sensor_index"].iloc[0]) if "sensor_index" in df.columns else None
        if sample_idx:
            print(f"\n=== Full detail for sensor {sample_idx} ===")
            detail = get_sensor(sample_idx)
            sensor = detail.get("sensor", detail)
            for k, v in sensor.items():
                print(f"  {k}: {v}")

    # 6. Time series — 7-day history for the Ballard sensor (index 2069)
    SENSOR_INDEX = 2069
    SENSOR_NAME = "Ballard"
    print(f"\n=== 7-day history for {SENSOR_NAME} (sensor {SENSOR_INDEX}) ===")
    hist = get_sensor_history(SENSOR_INDEX, days=7, average=60)
    print(f"Rows: {len(hist)}")
    print(hist.head(10).to_string())

    print("\n=== PM2.5 time-series stats ===")
    print(hist["pm2.5_atm"].describe())

    plot_sensor_history(hist, SENSOR_NAME, out_path="mp1a/sensor_history.png")
