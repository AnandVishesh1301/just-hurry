from flask import Flask
from flask import jsonify
from flask import request
from flask_cors import CORS
import configparser
import os
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from bson.objectid import ObjectId
import pandas as pd
import math
from math import radians, cos, sin, sqrt, atan2

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

        non_allocated_list = []
        for aidRequest in aidRequests:
            aidRequest["_id"] = str(aidRequest["_id"])  
            aidRequest["id"] = aidRequest["_id"]
            allocated = aidRequest.get("allocated")
            if not allocated:
                non_allocated_list.append(aidRequest)

        for vol in volunteer:
            vol["_id"] = str(vol["_id"])  
            vol["id"] = vol["_id"] 

        returnDict = {
            'emergencies': emergencies,
            'aidRequests': non_allocated_list,
            'volunteer': volunteer
        }

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
    @app.route('/allocate', methods=['GET'])
    def allocate():
        postId = ObjectId(request.args.get('id'))
        post = supplies_collection.find_one({"_id": postId})
        available = available_collection.find_one()

        ## post["food"], post["water"], and post["beds"] will return the resources requested in said instance. 
        ## Lat and long are in post["latitude"] and post["longitude"]
        # Haversine formula to calculate the distance between two lat/lon points
        def haversine(lat1, lon1, lat2, lon2):
            R = 6371.0  # Radius of the Earth in kilometers
            lat1 = radians(lat1)
            lon1 = radians(lon1)
            lat2 = radians(lat2)
            lon2 = radians(lon2)
            
            dlon = lon2 - lon1
            dlat = lat2 - lat1

            a = sin(dlat / 2)**2 + cos(lat1) * cos(lat2) * sin(dlon / 2)**2
            c = 2 * atan2(sqrt(a), sqrt(1 - a))

            distance = R * c
            return distance

        # Load the dataset
        df = pd.read_excel('final_dataset.xlsx')

        # User's coordinates
        latitude_user = post["latitude"]
        longitude_user = post["longitude"]

        # Dictionary to store distances and risk percentage
        distance_risk_map = {}

        # Iterate over each row to calculate haversine distance and store in the dictionary
        for index, row in df.iterrows():
            lat = row['Latitude']
            lon = row['Longitude']
            risk_percentage = row['Risk Percentage']
            
            distance = haversine(latitude_user, longitude_user, lat, lon)
            distance_risk_map[distance] = risk_percentage

        # Find the minimum distance and corresponding risk percentage
        min_distance = min(distance_risk_map)
        risk_percentage = distance_risk_map[min_distance]

        # Initial values for user and team (food, water, beds)
        initial_user_food = post["food"]
        initial_user_water = post["water"]
        initial_user_beds = post["beds"]

        initial_team_food = available["food"]
        initial_team_water = available["water"]
        initial_team_beds = available["bed"]

        # Function to calculate final_user_x
        def calculate_final_value(risk_percentage, initial_value):
            if risk_percentage < 0.6:
                return math.ceil(risk_percentage * initial_value)
            else:
                return initial_value + ((risk_percentage - 0.6) * 20)

        # Calculate final values for user
        final_user_food = calculate_final_value(risk_percentage, initial_user_food)
        final_user_water = calculate_final_value(risk_percentage, initial_user_water)
        final_user_beds = calculate_final_value(risk_percentage, initial_user_beds)

        # Subtract final_user_x values from initial_team_x values
        remaining_team_food = initial_team_food - final_user_food
        remaining_team_water = initial_team_water - final_user_water
        remaining_team_beds = initial_team_beds - final_user_beds

        supplies_collection.update_one({"_id": postId}, {"$set": {"food": final_user_food, "beds": final_user_beds, "water": final_user_water, "allocated": True}})
        available_collection.update_one(
            {"_id": available["_id"]}, 
            {"$set": {"food": remaining_team_food, "bed": remaining_team_beds, "water": remaining_team_water}})
        return jsonify({"food": final_user_food, "beds": final_user_beds, "water": final_user_water}), 200

    @app.route("/check_allocated", methods=["GET"])
    def check_allocated():
        postId = ObjectId(request.args.get('id'))
        post_info = supplies_collection.find_one({"_id": postId})
        post_info["_id"] = str(post_info["_id"])
        return jsonify(post_info), 200

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
