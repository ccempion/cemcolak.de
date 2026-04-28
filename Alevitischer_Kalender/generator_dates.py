import datetime
# You will need to install these via pip: pip install hijri-converter ics
from hijri_converter import Hijri, Gregorian
from ics import Calendar, Event

# --- 1. GET THE YEARS ---
def get_target_years():
    """Returns a list of the current year and the next three years."""
    current_year = datetime.date.today().year # Currently 2026
    return [current_year, current_year + 1, current_year + 2, current_year + 3]

# --- 2. CONVERT GREGORIAN DATES ---
def process_gregorian_events(gregorian_repo, target_years):
    """Loops through Gregorian holidays and maps them to the target years."""
    events_list = []
    for year in target_years:
        for holiday in gregorian_repo:
            # Logic to create a start date and end date based on duration
            start_date = datetime.date(year, holiday["month"], holiday["day"])
            end_date = start_date + datetime.timedelta(days=holiday["duration_days"] - 1)
            
            events_list.append({
                "name": holiday["name"],
                "start": start_date,
                "end": end_date,
                "description": holiday["description"]
            })
    return events_list

# --- YOUR CONVERSION FUNCTION ---
def convert_hijri_to_gregorian(hijri_dates):
    """
    Converts a list of Islamic (Hijri) dates to Gregorian dates.
    Takes a list of tuples: (year, month, day)
    """
    gregorian_dates = []
    
    for year, month, day in hijri_dates:
        try:
            # Initialize Hijri object and convert
            greg_obj = Hijri(year, month, day).to_gregorian()
            
            # NOTE: hijri_converter returns its own Gregorian object. 
            # We convert it to a standard Python datetime.date so we can add days to it later.
            standard_date = datetime.date(greg_obj.year, greg_obj.month, greg_obj.day)
            gregorian_dates.append(standard_date)
            
        except Exception as e:
            print(f"Error converting Hijri Date {year}-{month}-{day}: {e}")
            gregorian_dates.append(None)
            
    return gregorian_dates

def process_islamic_events(islamic_repo, target_years):
    """Converts Islamic month/day into Gregorian dates for the target years."""
    events_list = []
    
    # 1. Figure out the minimum and maximum Gregorian years we care about
    min_greg_year = min(target_years)
    max_greg_year = max(target_years)
    
    # 2. Find the corresponding Hijri years to establish our search range
    start_hijri_year = Gregorian(min_greg_year, 1, 1).to_hijri().year
    end_hijri_year = Gregorian(max_greg_year, 12, 31).to_hijri().year
    
    for holiday in islamic_repo:
        hijri_tuples = []
        
        # 3. Create tuples for this holiday across all relevant Hijri years
        for h_year in range(start_hijri_year, end_hijri_year + 1):
            hijri_tuples.append((h_year, holiday["month"], holiday["day"]))
            
        # 4. Pass them to your conversion function
        converted_dates = convert_hijri_to_gregorian(hijri_tuples)
        
        # 5. Filter the results and build the event dictionaries
        for greg_date in converted_dates:
            # Ensure the conversion was successful AND the date falls in our requested target years
            if greg_date and greg_date.year in target_years:
                
                # Handle multi-day durations
                end_date = greg_date + datetime.timedelta(days=holiday["duration_days"] - 1)
                
                events_list.append({
                    "name": holiday["name"],
                    "start": greg_date,
                    "end": end_date,
                    "description": holiday["description"]
                })
                
    return events_list

# --- 4. GENERATE THE ICS FILE ---
def generate_ics_file(all_events, filename="alevi_holidays.ics"):
    """Takes all processed events and creates an .ics file."""
    cal = Calendar()
    
    for event_data in all_events:
        e = Event()
        e.name = event_data["name"]
        e.begin = event_data["start"]
        e.end = event_data["end"] 
        e.description = event_data["description"]
        # make_all_day() automatically handles the +1 day ICS requirement
        e.make_all_day()
        cal.events.add(e)
        
    with open(filename, 'w', encoding='utf-8') as f:
        f.writelines(cal.serialize_iter())
    print(f"Successfully generated {filename}!")

# --- MAIN EXECUTION ---
if __name__ == "__main__":
    from depository import HOLIDAYS_DB # Assuming you put the dict in a separate file
    
    years = get_target_years()
    
    greg_events = process_gregorian_events(HOLIDAYS_DB["gregorian"], years)
    isl_events = process_islamic_events(HOLIDAYS_DB["islamic"], years)
    
    # Combine both lists
    all_calculated_events = greg_events + isl_events
    
    generate_ics_file(all_calculated_events)