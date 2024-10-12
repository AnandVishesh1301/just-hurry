from flask import Flask
from flask_pymongo import PyMongo
import configparser
import os
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

def create_app():
    app = Flask(__name__)

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
    
    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
