import React, { useState } from 'react';
import axios from 'axios';
import Image from 'next/image';
import foodImg from '../../constants/img/food.png';
import waterImg from '../../constants/img/water.png'; 
import bedsImg from '../../constants/img/bed.png';

export default function Home() {
  const [location, setLocation] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [food, setFood] = useState('');
  const [water, setWater] = useState('');
  const [beds, setBeds] = useState('');
  

  const handleClick = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            response = await axios.post('http://127.0.0.1:5000/save_coordinates', {
              longitude: longitude,
              latitude: latitude
            })
          } catch (error) {
            console.log("error")
          }

          setLocation({ latitude, longitude });
          setErrorMessage(null); // Clear any previous error message
        },
        (error) => {
          setErrorMessage('Unable to retrieve location. Please try again.');
        }
      );
    } else {
      setErrorMessage('Geolocation is not supported by your browser.');
    }
  };

  // New function to handle the submit request
  const handleRequestSubmit = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/save_supplies', {
        food: parseInt(food), // Convert to integer
        water: parseInt(water), // Convert to integer
        beds: parseInt(beds) // Convert to integer
      });
      console.log(response.data); // Handle the response as needed
    } catch (error) {
      console.error("Error submitting supplies:", error);
      setErrorMessage('Error submitting supplies. Please try again.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <button
        onClick={handleClick}
        className="bg-red-500 text-white font-bold py-4 px-8 rounded-lg shadow-lg transition-opacity duration-200 active:opacity-70 focus:outline-none mb-4"
      >
        🚨 Emergency 🚨
      </button>

      {location && (
        <p> Sit tight, help is on the way! </p>
      )}

      {errorMessage && (
        <div className="text-center text-red-500 text-lg mt-2">
          {errorMessage}
        </div>
      )}


      {/* Input Fields for Food, Water, Beds */}
      <div className="w-full max-w-xs">
        {/* Food Input */}
        <div className="flex justify-between mb-4">
          <label className="text-lg font-medium">Food:</label>
          <input
            type="text"
            value={food}
            onChange={(e) => setFood(e.target.value)}
            className="border-2 border-gray-300 rounded px-2 py-1 w-1/2"
            placeholder="Enter food amount"
          />
          <Image
            src={foodImg}   
            alt="Food"
            className="w-10 h-10 ml-4"
          />
        </div>
        {/* Water Input */}
        <div className="flex justify-between mb-4">
          <label className="text-lg font-medium">Water:</label>
          <input
            type="text"
            value={water}
            onChange={(e) => setWater(e.target.value)}
            className="border-2 border-gray-300 rounded px-2 py-1 w-1/2"
            placeholder="Enter water amount"
          />
          <Image
            src={waterImg}   
            alt="Water"
            className="w-10 h-10 ml-4"
          />
        </div>
        {/* Beds Input */}
        <div className="flex justify-between mb-6">
          <label className="text-lg font-medium">Beds:</label>
          <input
            type="text"
            value={beds}
            onChange={(e) => setBeds(e.target.value)}
            className="border-2 border-gray-300 rounded px-2 py-1 w-1/2"
            placeholder="Enter number of beds"
          />
          <Image
            src={bedsImg}   
            alt="Beds"
            className="w-10 h-10 ml-4"
          />
        </div>

        {/* Request Button */}
        <button
          onClick={handleRequestSubmit}
          className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-opacity duration-200 active:opacity-70 focus:outline-none w-full"
        >
          Submit Request
        </button>
      </div>
      
    </div>
  );
}
