from flask import Flask
from flask import jsonify
from flask import request
from flask_cors import CORS
from flask_pymongo import PyMongo
import configparser
import os
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

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

    # Initialize PyMongo with the app
    #mongo = PyMongo(app)
    

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
    
    # Define a route for saving coordinates
    @app.route('/save_coordinates', methods=['POST'])
    def save_coordinates():
        print("route fired")
        # Fetch latitude and longitude from the request body (JSON data)
        data = request.json
        latitude = data.get('latitude')
        longitude = data.get('longitude')
        
        if latitude is None or longitude is None:
            return jsonify({"error": "Missing latitude or longitude"}), 400
        
        # Create a dictionary to represent the document
        location_data = {
            "latitude": latitude,
            "longitude": longitude
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

        if food is None or water is None or beds is None:
            return jsonify({"error": "Missing food, water, or beds value"}), 400

        supplies_data = {
            "food": food,
            "water": water,
            "beds": beds
        }

        result = supplies_collection.insert_one(supplies_data)
        return jsonify({"message": "Supplies saved", "id": str(result.inserted_id)}), 201
    
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
        
    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
