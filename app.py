from flask import Flask
from flask import jsonify
from flask import request
from flask_cors import CORS
import configparser
import os
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from bson.objectid import ObjectId
import math
from math import radians, sin, cos, sqrt, atan2
import pandas as pd

def create_app():
    app = Flask(__name__)
    
    # Enable CORS for the Flask app
    CORS(app)

    # Read the MongoDB URI from the .ini file
    config = configparser.ConfigParser()
    config.read(os.path.abspath(os.path.join('config.ini')))
    mongo_uri = config['PROD']['DB_URI']
    
    # Set the URI for Flask-PyMongo
    app.config["MONGO_URI"] = mongo_uri

    # Ping MongoDB to confirm the connection
    client = MongoClient(mongo_uri, server_api=ServerApi('1'))
    
    try:
        client.admin.command('ping')
        print("Pinged your deployment. You successfully connected to MongoDB!")
    except Exception as e:
        print(f"Connection failed: {e}")
        
    db = client.get_database("Coordinates")
    coordinates_collection = db.get_collection("Location")
    supplies_collection = db.get_collection("Supplies")
    volunteer_collection = db.get_collection('Volunteers')
    available_collection = db.get_collection("Available")
    
    # Define a route for saving coordinates
    @app.route('/save_coordinates', methods=['POST'])
    def save_coordinates():
        print("route fired")
        # Fetch latitude and longitude from the request body (JSON data)
        data = request.json
        latitude = data.get('latitude')
        longitude = data.get('longitude')
        name = data.get('name')

        print("data: ", data)
        print("name: ", name)
        
        if latitude is None or longitude is None or name is None:
            return jsonify({"error": "Missing latitude or longitude"}), 400
        
        # Create a dictionary to represent the document
        location_data = {
            "latitude": latitude,
            "longitude": longitude,
            "name": name
        }
        
        # Insert the data into the Coordinates.Location collection
        result = coordinates_collection.insert_one(location_data)
        print(result)
        
        return jsonify({"message": "Location saved", "id": str(result.inserted_id)}), 201
    
    # New route for saving supplies
    @app.route('/save_supplies', methods=['POST'])
    def save_supplies():
        print("Supplies route fired")
        data = request.json
        food = data.get('food')
        water = data.get('water')
        beds = data.get('beds')
        name = data.get('name')
        latitude = data.get('latitude')
        longitude = data.get('longitude')
        purpose = data.get('purpose')

        if food is None or water is None or beds is None or name is None or purpose is None:
            return jsonify({"error": "Missing food, water, or beds value"}), 400

        supplies_data = {
            "food": food,
            "water": water,
            "beds": beds,
            "name": name,
            'latitude': latitude,
            'longitude': longitude,
            'purpose': purpose
        }

        result = supplies_collection.insert_one(supplies_data)
        return jsonify({"message": "Supplies saved", "id": str(result.inserted_id)}), 201
    
    @app.route('/save_volunteer', methods=['POST'])
    def save_volunteer():
        data = request.json
        name = data.get('name')
        hours = data.get('hours')
        latitude = data.get('latitude')
        longitude = data.get('longitude')
        daysOfWeek = data.get('daysOfWeek')

        if name is None or hours is None or latitude is None or longitude is None or daysOfWeek is None:
            return jsonify({"error": "Missing food, water, or beds value"}), 400
        
        if not isinstance(daysOfWeek, list) or len(daysOfWeek) == 0:  # Ensure it's a non-empty list
            return jsonify({"error": "Please select at least one day of the week"}), 400
        
        save_data = {
            'name': name,
            'hours': hours,
            'latitude': latitude,
            'longitude': longitude,
            'daysOfWeek': daysOfWeek
        }

        result = volunteer_collection.insert_one(save_data)

        return jsonify({"message": "Volunteer saved", "id": str(result.inserted_id)}), 201
    
    
    # New route for getting the latest coordinates back from the DB
    @app.route('/get_coordinates', methods=['GET'])
    def get_coordinates():
        # Fetch the latest coordinates (you can adjust the query as needed)
        latest_coordinate = coordinates_collection.find_one(sort=[('_id', -1)])  # Get the most recent entry

        if latest_coordinate is None:
            return jsonify({"error": "No coordinates found"}), 404

        # Convert ObjectId to string
        latest_coordinate["_id"] = str(latest_coordinate["_id"])
        print(latest_coordinate)

        return jsonify(latest_coordinate), 200
    
    
    # New route for getting supplies
    @app.route('/get_supplies', methods=['GET'])
    def get_supplies():
        print("Get supplies route fired")
        
        # Fetch the latest supply entry
        latest_supply = supplies_collection.find_one(sort=[('_id', -1)])  # Sort by _id in descending order to get the latest

        if latest_supply is None:
            return jsonify({"error": "No supplies found"}), 404
        # Convert ObjectId to string
        latest_supply['_id'] = str(latest_supply['_id'])
        print(latest_supply)

        return jsonify(latest_supply), 200
    

    # get all data from db
    @app.route('/get_all', methods=['GET'])
    def get_all():
        
        emergencies = list(coordinates_collection.find())
        aidRequests = list(supplies_collection.find())
        volunteer = list(volunteer_collection.find())

        for emergency in emergencies:
            emergency["_id"] = str(emergency["_id"])  
            emergency["id"] = emergency["_id"] 

        
        for aidRequest in aidRequests:
            aidRequest["_id"] = str(aidRequest["_id"])  
            aidRequest["id"] = aidRequest["_id"]  

        for vol in volunteer:
            vol["_id"] = str(vol["_id"])  
            vol["id"] = vol["_id"] 

        returnDict = {
            'emergencies': emergencies,
            'aidRequests': aidRequests,
            'volunteer': volunteer
        }

        print(returnDict)

        # Return the response as JSON
        return jsonify(returnDict), 200
    

    # get available resources
    @app.route('/get_available')
    def get_available():
        available = available_collection.find_one()

        returnDict = {
            "food": available["food"],
            "bed": available["bed"],
            "water": available["water"]
        }
        return jsonify(returnDict), 200
    
    # post allocation of resources to a specific supplies needed post
    @app.route('/allocate', methods=['POST'])
    def allocate():
        data = request.json
        print("data: ", data)
        postId = ObjectId(data["_id"])

        print("post: ", postId)

        post = supplies_collection.find_one({"_id": postId})
        available = available_collection.find_one()

        # post["food"], post["water"], and post["beds"] will return the resources requested in said instance. 
        # lat and long are in post["latitude"] and post["longitude"]

        def haversine_distance(lat1, lon1, lat2, lon2):
            R = 6371  # Earth's radius in kilometers

            lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
            dlat = lat2 - lat1
            dlon = lon2 - lon1

            a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
            c = 2 * atan2(sqrt(a), sqrt(1-a))
            distance = R * c

            return distance

        def calculate_final_user_value(risk_percentage, initial_value):
            if risk_percentage < 0.6:
                return math.ceil(risk_percentage * initial_value)
            else:
                return initial_value + ((risk_percentage - 0.6) * 20)

        # Read the dataset
        df = pd.read_excel("final_dataset.xlsx")

        # User's latitude and longitude
        latitude_user = post["latitude"]
        longitude_user = post["longitude"]

        # Calculate distances and store with risk percentages
        distances = {}
        for index, row in df.iterrows():
            distance = haversine_distance(latitude_user, longitude_user, row['latitude'], row['longitude'])
            distances[distance] = row['Risk Percentage']

        # Find the minimum distance and get the corresponding risk percentage
        min_distance = min(distances.keys())
        risk_percentage = distances[min_distance]

        # Initial values
        allocatedFood = post["food"]
        allocatedWater = post["water"]
        allocatedBeds = post["beds"]

        availableFood = available["food"]
        availableWater = available["water"]
        availableBeds = available["beds"]

        # Calculate final user values
        final_user_food = calculate_final_user_value(risk_percentage, allocatedFood)
        final_user_water = calculate_final_user_value(risk_percentage, allocatedWater)
        final_user_beds = calculate_final_user_value(risk_percentage, allocatedBeds)

        # Calculate remaining team resources
        remaining_team_food = availableFood - final_user_food
        remaining_team_water = availableWater - final_user_water
        remaining_team_beds = availableBeds - final_user_beds

        supplies_collection.update_one({"_id": postId}, {"$set": {"food": final_user_food, "beds": final_user_beds, "water": final_user_water, "allocated": True}})
        available_collection.update_one(
            {"_id": available["_id"]}, 
            {"$set": {"food": remaining_team_food, "bed": remaining_team_beds, "water": remaining_team_water}})

        return jsonify({"food": final_user_food, "beds": final_user_beds, "water": final_user_water}), 200
    
    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
