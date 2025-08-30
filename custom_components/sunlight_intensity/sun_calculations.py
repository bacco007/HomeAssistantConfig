"""Sun calculation functions."""
import math
from datetime import datetime, timedelta
import pytz


def calculate_sun_angle(latitude, longitude, dt=None, timezone_str='UTC'):
    """
    Calculate the sun's elevation and azimuth angles for a given location and time.
    
    Args:
        latitude (float): Latitude in degrees (-90 to 90)
        longitude (float): Longitude in degrees (-180 to 180)
        dt (datetime, optional): Datetime object. If None, uses current time
        timezone_str (str): Timezone string (e.g., 'UTC', 'America/New_York')
    
    Returns:
        dict: {'elevation': float, 'azimuth': float} in degrees
    """
    
    # Use current time with timezone_str
    dt = datetime.now(pytz.timezone(timezone_str))
    
    # Ensure datetime is timezone-aware
    if dt.tzinfo is None:
        dt = pytz.timezone(timezone_str).localize(dt)
    
    # Convert to UTC for calculations
    # dt_utc = (dt + timedelta(hours=1)).astimezone(pytz.UTC)
    
    # Find difference between user timezone and utc.  
    tz1 = pytz.timezone(timezone_str)
    now = datetime.now()
    tzDiff = tz1.utcoffset(now).total_seconds()/3600
    #print(f"Time Difference: {tzDiff}")


    # Convert to UTC for calculations
    dt_utc = (dt + timedelta(hours=tzDiff)).astimezone(pytz.UTC) # New line to add difference between user timezone and UTC
    
    # Convert latitude and longitude to radians
    lat_rad = math.radians(latitude)
    lon_rad = math.radians(longitude)
    
    # Calculate day of year
    day_of_year = dt_utc.timetuple().tm_yday
    
    # Calculate solar declination angle
    declination = 23.45 * math.sin(math.radians(360 * (284 + day_of_year) / 365))
    declination_rad = math.radians(declination)
    
    # Calculate equation of time (solar time correction)
    B = math.radians(360 * (day_of_year - 81) / 365)
    equation_of_time = 9.87 * math.sin(2 * B) - 7.53 * math.cos(B) - 1.5 * math.sin(B)
    
    # Calculate local solar time
    local_clock_time = dt_utc.hour + dt_utc.minute / 60 + dt_utc.second / 3600
    
    # Time zone offset in hours from UTC
    timezone_offset = dt.utcoffset().total_seconds() / 3600
    
    # Time correction in minutes
    time_correction = equation_of_time + 4 * (longitude - timezone_offset * 15)
    solar_time = local_clock_time + time_correction / 60
    
    # Calculate hour angle
    hour_angle = math.radians(15 * (solar_time - 12))
    
    # Calculate solar elevation angle
    elevation = math.asin(
        math.sin(declination_rad) * math.sin(lat_rad) +
        math.cos(declination_rad) * math.cos(lat_rad) * math.cos(hour_angle)
    )
    
    # Calculate solar azimuth angle
    azimuth = math.atan2(
        math.sin(hour_angle),
        math.cos(hour_angle) * math.sin(lat_rad) - math.tan(declination_rad) * math.cos(lat_rad)
    )
    
    # Convert from radians to degrees
    elevation_deg = math.degrees(elevation)
    azimuth_deg = math.degrees(azimuth)
    
    # Adjust azimuth to 0-360 range
    if azimuth_deg < 0:
        azimuth_deg += 360
    
    return {
        'elevation': elevation_deg,
        'azimuth': azimuth_deg
    }

def angle_to_percentage(angle, offset, wall, sun_elevation):
    """
    Converts an angle (in degrees) to a percentage.
    """

    if sun_elevation <= 0:
        return 0

    angle = angle % 360  # Normalize to 0–359
    angle = angle - offset
    angle = angle % 360  # Normalize to 0–359

    if wall == 'back':
        if 270 <= angle <= 360:
            # Rising from 270 to 0 (360), e.g., 270 → 0%, 315 → 50%, 360/0 → 100%
            return (angle - 270) / 90 * 100
        elif 0 <= angle <= 90:
            # Falling from 0 to 90, e.g., 0 → 100%, 45 → 50%, 90 → 0%
            return (1-(angle / 90)) * 100
        else:
            return 0
        
    elif wall == 'left':
        if angle >= 0 and angle <= 180:
            if angle <= 90:
                # Rising from 270 to 360 (0), e.g., 270 → 0%, 315 → 50%, 360/0 → 100%
                return (angle) / 90 * 100
            else:
                # Falling from 0 to 90, e.g., 0 → 100%, 45 → 50%, 90 → 0%
                return (-(angle-180)) / 90 * 100
        else:
            return 0

    elif wall == 'right':
        if angle >= 180 and angle <= 360:
            if angle <= 270:
                # Rising from 270 to 360 (0), e.g., 270 → 0%, 315 → 50%, 360/0 → 100%
                return (angle-180) / 90 * 100
            else:
                # Falling from 0 to 90, e.g., 0 → 100%, 45 → 50%, 90 → 0%
                return (-(angle-360)) / 90 * 100
        else:
            return 0

    elif wall == 'front':
        if angle >= 90 and angle <= 270:
            if angle <= 180:
                # Rising from 270 to 360 (0), e.g., 270 → 0%, 315 → 50%, 360/0 → 100%
                return (angle - 90) / 90 * 100
            else:
                # Falling from 0 to 90, e.g., 0 → 100%, 45 → 50%, 90 → 0%
                return (-(angle-270)) / 90 * 100
        else:
            return 0
