MET = {"walk": {"light": 2.8, "moderate": 3.5, "vigorous": 5.0}, "run": {"light": 7.0, "moderate": 9.8, "vigorous": 12.0}, "cycling": {"light": 4.0, "moderate": 6.8, "vigorous": 10.0}, "yoga": {"light": 2.5, "moderate": 3.0, "vigorous": 4.0}, "strength": {"light": 3.5, "moderate": 5.0, "vigorous": 6.0}}
def calories_burned(activity_type, intensity, duration_minutes, weight_kg):
    return round(MET[activity_type][intensity] * 3.5 * weight_kg / 200 * duration_minutes)
