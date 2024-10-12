# Import the packages
import pandas as pd
import re
import geopandas as gpd
from shapely.geometry import Point
import numpy as np
from scipy.spatial import cKDTree

# Load the raw income dataset
raw_income_df = pd.read_excel('raw_income_dataset.xlsx')

# Extract the necessary columns
geo_names = raw_income_df['Geographic Area Name']
median_incomes = raw_income_df['Median Income']

# Initialize lists to store extracted city and state names
cities = []
states = []

# Define a pattern to match and remove descriptors like 'city', 'municipality', etc.
descriptor_pattern = r'\s+(city|municipality|province|town|village|borough|CDP)$'

for geo_name in geo_names:
    # Split the Geographic Area Name by comma to separate city and state
    if ',' in geo_name:
        city_state = geo_name.split(',')
        city_part = city_state[0].strip()
        state_part = city_state[1].strip()
    else:
        # Handle cases where there is no comma
        city_part = geo_name.strip()
        state_part = ''
    
    # Remove descriptors like 'city', 'municipality', etc.
    city_name = re.sub(descriptor_pattern, '', city_part, flags=re.IGNORECASE)
    cities.append(city_name)
    states.append(state_part)

# Create the new DataFrame
processed_df = pd.DataFrame({
    'City': cities,
    'State': states,
    'Median Income': median_incomes
})

# Define a list of the 50 US states
us_states_list = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
    'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
    'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
    'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
    'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
    'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
    'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
    'Wisconsin', 'Wyoming'
]

# Normalize the 'State' column: strip whitespace and title case
processed_df['State'] = processed_df['State'].str.strip().str.title()

# Filter the DataFrame to only include rows where 'State' is one of the 50 US states
income_processed_df = processed_df[processed_df['State'].isin(us_states_list)].reset_index(drop=True)

# Normalize the 'City' column: strip whitespace and title case
income_processed_df['City'] = income_processed_df['City'].str.strip().str.title()

# Load the raw cities population dataset
raw_cities_df = pd.read_excel('raw_cities_population_dataset.xlsx')

# Drop the original 'State' column if it exists to avoid confusion
if 'State' in raw_cities_df.columns:
    raw_cities_df = raw_cities_df.drop(columns=['State'])

# Filter for cities in the USA
usa_cities_df = raw_cities_df[raw_cities_df['Country'].isin(['United States', 'USA', 'U.S.', 'US'])]

# Define longitude and latitude ranges
min_longitude, max_longitude = -100, -65
min_latitude, max_latitude = 24, 47

# Apply the geographical filters
population_processed_df = usa_cities_df[
    (usa_cities_df['Longitude'] >= min_longitude) & (usa_cities_df['Longitude'] <= max_longitude) &
    (usa_cities_df['Latitude'] >= min_latitude) & (usa_cities_df['Latitude'] <= max_latitude)
].copy().reset_index(drop=True)

# Ensure latitude and longitude are numeric and drop rows with missing values
population_processed_df['Latitude'] = pd.to_numeric(population_processed_df['Latitude'], errors='coerce')
population_processed_df['Longitude'] = pd.to_numeric(population_processed_df['Longitude'], errors='coerce')
population_processed_df.dropna(subset=['Latitude', 'Longitude'], inplace=True)
population_processed_df.reset_index(drop=True, inplace=True)

# Load U.S. states shapefile
us_states_gdf = gpd.read_file('shapes/cb_2018_us_state_500k.shp')

# Exclude non-contiguous states and territories if desired
contiguous_us_states = us_states_gdf[~us_states_gdf['STUSPS'].isin(['AK', 'HI', 'PR', 'GU', 'VI', 'AS', 'MP'])].copy()
contiguous_us_states.reset_index(drop=True, inplace=True)
contiguous_us_states = contiguous_us_states.to_crs("EPSG:4326")

# Create geometry column from latitude and longitude
geometry = [Point(xy) for xy in zip(population_processed_df['Longitude'], population_processed_df['Latitude'])]
population_gdf = gpd.GeoDataFrame(population_processed_df, geometry=geometry, crs="EPSG:4326")

# Perform spatial join to assign 'State'
population_gdf = gpd.sjoin(
    population_gdf,
    contiguous_us_states[['NAME', 'geometry']],
    how='left',
    predicate='intersects'
)

# Rename columns appropriately
population_gdf.rename(columns={'NAME': 'State'}, inplace=True)
population_gdf.drop(columns=['index_right'], inplace=True)

# Load U.S. cities dataset
us_cities = pd.read_csv('shapes/uscities.csv')
us_cities = us_cities[['city', 'state_name', 'lat', 'lng']]

# Build KDTree from city coordinates
city_coords = np.radians(us_cities[['lat', 'lng']].values)
city_tree = cKDTree(city_coords)

# Get coordinates from population_gdf and convert to radians
population_coords = np.radians(population_gdf[['Latitude', 'Longitude']].values)

# Query KDTree to find the nearest city
distances, indices = city_tree.query(population_coords, k=1)

# Replace the 'City' column with the new city names
population_gdf['City'] = us_cities.iloc[indices]['city'].values

# Format 'City' and 'State' to title case
population_gdf['City'] = population_gdf['City'].str.title()
population_gdf['State'] = population_gdf['State'].str.title()

# Drop unnecessary columns
population_gdf.drop(columns=['geometry'], inplace=True)

# Drop rows where 'City' or 'State' is missing
population_gdf.dropna(subset=['City', 'State'], inplace=True)
population_gdf.reset_index(drop=True, inplace=True)

# Save the Processed DataFrame
population_processed_df = population_gdf

# Convert 'City' and 'State' names to lowercase and strip whitespace in income_processed_df
income_processed_df['City'] = income_processed_df['City'].str.lower().str.strip()
income_processed_df['State'] = income_processed_df['State'].str.lower().str.strip()

# Convert 'City' and 'State' names to lowercase and strip whitespace in population_processed_df
population_processed_df['City'] = population_processed_df['City'].str.lower().str.strip()
population_processed_df['State'] = population_processed_df['State'].str.lower().str.strip()

# Perform a left merge on 'City' and 'State' columns
merged_df = pd.merge(
    population_processed_df,
    income_processed_df[['City', 'State', 'Median Income']],
    on=['City', 'State'],
    how='left'
)

# Convert 'City' and 'State' names back to title case
merged_df['City'] = merged_df['City'].str.title()
merged_df['State'] = merged_df['State'].str.title()

# Convert 'Median Income' to numeric, coercing errors to NaN
merged_df['Median Income'] = pd.to_numeric(merged_df['Median Income'], errors='coerce')

# Remove rows where 'Median Income' is NaN or 0
merged_df = merged_df[merged_df['Median Income'].notna() & (merged_df['Median Income'] != 0)]

# Drop duplicates based on 'City' and 'State'
merged_df = merged_df.drop_duplicates(subset=['City', 'State'], keep='first').reset_index(drop=True)

# Remove the 'Country' column if it exists
if 'Country' in merged_df.columns:
    merged_df = merged_df.drop(columns=['Country'])

# Save the merged dataframe to an Excel file
merged_df.to_excel('final_population_income_dataset.xlsx', index=False)