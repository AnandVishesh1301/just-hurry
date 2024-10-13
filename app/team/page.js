"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import axios from "axios";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { MapPin, Package, Droplet, Bed, Clock, Calendar } from "lucide-react";

const EmergencyMap = dynamic(() => import("../components/EmergencyMap.js"), {
  ssr: false,
});

const EmergencyCard = ({ name, latitude, longitude }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className="bg-red-100 ro  unded-lg shadow-md p-3 flex flex-col justify-between hover:bg-red-200 transition-colors duration-200"
  >
    <h3 className="text-md font-semibold text-gray-800">{name}</h3>
    <div className="text-sm text-gray-600">
      <p className="flex items-center">
        <MapPin size={14} className="mr-1 text-red-500" /> {latitude.toFixed(4)}, {longitude.toFixed(4)}
      </p>
    </div>
  </motion.div>
);

const Card = ({ title, children, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className={`rounded-lg shadow-md p-4 mb-4 transition-colors duration-200 ${className}`}
  >
    <h3 className="text-lg font-semibold mb-2 text-gray-800">{title}</h3>
    {children}
  </motion.div>
);

export default function Relief() {
  const [emergencies, setEmergencies] = useState([]);
  const [aidRequests, setAidRequests] = useState([]);
  const [volunteers, setVolunteers] = useState([]);

  // available resources
  const [food, setFood] = useState(null);
  const [beds, setBeds] = useState(null);
  const [water, setWater] = useState(null);

  useEffect(() => {
    const getData = async () => {
      try {
        const available = await axios.get("http://127.0.0.1:5000/get_available");
        setFood(available.data.food);
        setBeds(available.data.bed);
        setWater(available.data.water);
        // Fetch data from the API
        const response = await axios.get("http://127.0.0.1:5000/get_all");
        const newData = response.data; // Access the 'data' field from Axios response

        console.log("data: ", newData);
        const newEmergencies = newData.emergencies || [];
        let newAid = newData.aidRequests || [];
        const newVolunteers = newData.volunteer || [];

        console.log("volunteers new: ", newVolunteers);

        const daysDictionary = {
          0: "Su",
          1: "M",
          2: "Tu",
          3: "W",
          4: "Th",
          5: "F",
          6: "Sa",
          7: "Sa", // Added for full week if you need to use 7 as Sunday
        };

        const formattedVolunteers = newVolunteers.map(vol => {
          return {
            ...vol, // Spread existing properties
            daysOfWeek: vol.daysOfWeek.map(day => daysDictionary[day] || day) // Map daysOfWeek using the daysDictionary
          };
        });

        // Update state
        setEmergencies(newEmergencies);
        setAidRequests(newAid);
        setVolunteers(formattedVolunteers); // Use formatted volunteers
        console.log("volunteers: ", formattedVolunteers);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    getData();
  }, []);

  const handleAllocate = async (postId) => {
    respose = await axios.post("http://127.0.0.1:5000/allocate", {
      _id: postId
    });
    console.log("response from allocate: ", response);
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <div className="absolute top-2 left-4">
        <Image
          src="/logo.png"
          alt="Logo"
          width={200}
          height={200}
          className="md:w-32 md:h-32 w-24 h-24"
        />
      </div>
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-bold text-center text-gray-800 pt-24 pb-8"
      >
        Relief Dashboard
      </motion.h1>
      <div className="container mx-auto px-4 pb-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-2/3 space-y-8">
            <Card className="bg-white overflow-hidden">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                Emergency Map
              </h2>
              <div className="h-96 mb-4">
                <EmergencyMap emergencies={emergencies} />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">
                Active Emergencies
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {emergencies.map((emergency) => (
                  <EmergencyCard
                    key={emergency.id}
                    name={emergency.name}
                    latitude={emergency.latitude}
                    longitude={emergency.longitude}
                  />
                ))}
              </div>
            </Card>
          </div>
          <div className="w-full lg:w-1/3 space-y-8">
            <Card className="bg-white">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-2xl font-semibold text-gray-800">
                  Aid Needed
                </h2>
                {/* New "Availability" section */}
                <div className="text-right">
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Availability</h3>
                  <div className="flex gap-4">
                    <div className="flex items-center">
                      <Package size={16} className="mr-1 text-orange-500" />
                      <span>{food}</span> {/* Static value for food */}
                    </div>
                    <div className="flex items-center">
                      <Droplet size={16} className="mr-1 text-blue-500" />
                      <span>{beds}</span> {/* Static value for water */}
                    </div>
                    <div className="flex items-center">
                      <Bed size={16} className="mr-1 text-green-500" />
                      <span>{water}</span> {/* Static value for beds */}
                    </div>
                  </div>
                </div>
              </div>
              
            
              <div className="space-y-4 overflow-y-auto max-h-[calc(50vh-2rem)]">
                {aidRequests.map((request) => (
                  <Card
                    key={request.id}
                    title={request.purpose}
                    className="bg-orange-100 hover:bg-orange-200 relative"
                  >
                    <div className="flex flex-wrap items-center gap-4 mb-2 text-sm">
                      <div className="flex items-center">
                        <Package size={16} className="mr-1 text-orange-500" />
                        <span>Food: {request.food}</span>
                      </div>
                      <div className="flex items-center">
                        <Droplet size={16} className="mr-1 text-blue-500" />
                        <span>Water: {request.water}</span>
                      </div>
                      <div className="flex items-center">
                        <Bed size={16} className="mr-1 text-green-500" />
                        <span>Beds: {request.beds}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 flex items-center">
                      <MapPin size={14} className="mr-1 text-gray-400" />
                      {request.latitude.toFixed(4)},{" "}
                      {request.longitude.toFixed(4)}
                    </p>
                    {/* Allocate Button */}
                    <button
                      onClick={(request) => handleAllocate(request._id)}
                      className="absolute bottom-2 right-2 bg-orange-200 hover:bg-orange-300 text-orange-700 font-semibold py-1 px-2 rounded text-xs"
                    >
                      Allocate
                    </button>
                  </Card>
                ))}
              </div>
            </Card>
            <Card className="bg-white">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                Volunteers
              </h2>
              <div className="space-y-4 overflow-y-auto max-h-[calc(50vh-2rem)]">
                {volunteers.map((volunteer) => (
                  <Card
                    key={volunteer.id}
                    title={volunteer.name}
                    className="bg-orange-100 hover:bg-orange-200"
                  >
                    <p className="flex items-center text-sm text-gray-600 mb-1">
                      <Clock size={14} className="mr-1 text-orange-500" />
                      Hours Available: {volunteer.hours}
                    </p>
                    <p className="flex items-center text-sm text-gray-600 mb-2">
                      <Calendar size={14} className="mr-1 text-orange-500" />
                      Days: {volunteer.daysOfWeek.join(', ')}
                    </p>
                  </Card>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
