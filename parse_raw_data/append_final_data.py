# Import the packages
import pandas as pd
import numpy as np
from scipy.spatial import cKDTree

# Load the hurricane dataset
hurricane_df = pd.read_excel('final_hurricanes_dataset.xlsx')

# Load the city dataset
city_df = pd.read_excel('final_population_income_dataset.xlsx')

# Ensure latitude and longitude are numeric
hurricane_df['Latitude'] = pd.to_numeric(hurricane_df['Latitude'], errors='coerce')
hurricane_df['Longitude'] = pd.to_numeric(hurricane_df['Longitude'], errors='coerce')

city_df['Latitude'] = pd.to_numeric(city_df['Latitude'], errors='coerce')
city_df['Longitude'] = pd.to_numeric(city_df['Longitude'], errors='coerce')

# Drop rows with missing coordinates
hurricane_df.dropna(subset=['Latitude', 'Longitude'], inplace=True)
city_df.dropna(subset=['Latitude', 'Longitude'], inplace=True)

# Extract coordinates
city_coords = np.radians(city_df[['Latitude', 'Longitude']].values)
hurricane_coords = np.radians(hurricane_df[['Latitude', 'Longitude']].values)

# Build KDTree
city_tree = cKDTree(city_coords)

# Query for nearest city
distances, indices = city_tree.query(hurricane_coords, k=1)

# Retrieve closest city information
closest_cities = city_df.iloc[indices].reset_index(drop=True)

# Add city information to hurricane DataFrame
hurricane_df['Closest City'] = closest_cities['City']
hurricane_df['Closest State'] = closest_cities['State']
hurricane_df['Population'] = closest_cities['Population']
hurricane_df['Median Income'] = closest_cities['Median Income']

# Calculate haversine distances
def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371.0  # Earth radius in kilometers
    phi1 = np.radians(lat1)
    phi2 = np.radians(lat2)
    delta_phi = np.radians(lat2 - lat1)
    delta_lambda = np.radians(lon2 - lon1)
    a = np.sin(delta_phi / 2.0) ** 2 + \
        np.cos(phi1) * np.cos(phi2) * np.sin(delta_lambda / 2.0) ** 2
    c = 2 * np.arcsin(np.sqrt(a))
    distance = R * c
    return distance

hurricane_df['Distance to Closest City (km)'] = haversine_distance(
    hurricane_df['Latitude'],
    hurricane_df['Longitude'],
    closest_cities['Latitude'],
    closest_cities['Longitude']
)

# Remove the 'Hurricane Year' column
if 'Hurricane Year' in hurricane_df.columns:
    hurricane_df = hurricane_df.drop(columns=['Hurricane Year'])

# Check for recurring cities for the same hurricane
# Group by 'Hurricane Name' and 'Closest City' and aggregate
aggregated_df = hurricane_df.groupby(['Hurricane Name', 'Closest City', 'Closest State']).agg({
    'Maximum Wind Speed': 'mean',
    'Air Pressure at Storm\'s Center': 'mean',
    'Latitude': 'mean',
    'Longitude': 'mean',
    'Population': 'first',
    'Median Income': 'first'
}).reset_index()

# Save the updated hurricane dataset
aggregated_df.to_excel('final_combined_dataset.xlsx', index=False)