"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";


export default function EmergencyDashboard() {
  const router = useRouter();

  const [location, setLocation] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isSOSButtonDisabled, setIsSOSButtonDisabled] = useState(false);
  const [isSOSLoading, setIsSOSLoading] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [food, setFood] = useState("0");
  const [water, setWater] = useState("0");
  const [beds, setBeds] = useState("0");
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isResourceLoading, setIsResourceLoading] = useState(false);
  const [resourceErrorMessage, setResourceErrorMessage] = useState(null);
  const [isRequestSubmitted, setIsRequestSubmitted] = useState(false);
  const [purpose, setPurpose] = useState("");

  const modalRef = useRef(null);

  useEffect(() => {
    let timer;
    if (isSOSButtonDisabled && timeRemaining > 0) {
      timer = setTimeout(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      setIsSOSButtonDisabled(false);
    }
    return () => clearTimeout(timer);
  }, [isSOSButtonDisabled, timeRemaining]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowResourceModal(false);
        setResourceErrorMessage(null);
      }
    }
    if (showResourceModal) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showResourceModal]);

  const handleSOSClick = async () => {
    if (navigator.geolocation) {
      setIsSOSLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const savedName = sessionStorage.getItem("userName");

          try {
            await axios.post("http://127.0.0.1:5000/save_coordinates", {
              longitude: longitude,
              latitude: latitude,
              name: savedName,
            });
            setLocation({ latitude, longitude });
            setErrorMessage(null);
            alert(
              "SOS sent successfully. Authorities have been notified and are sending troops to your location."
            );
            setIsSOSButtonDisabled(true);
            setTimeRemaining(300);
          } catch (error) {
            console.error("Error sending SOS:", error);
            setErrorMessage("Unable to send SOS. Please try again.");
          } finally {
            setIsSOSLoading(false);
          }
        },
        (error) => {
          setErrorMessage("Unable to retrieve location. Please try again.");
          setIsSOSLoading(false);
        }
      );
    } else {
      setErrorMessage("Geolocation is not supported by your browser.");
    }
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();

    // Check if geolocation is available
    if (!navigator.geolocation) {
      setErrorMessage("Geolocation is not supported by your browser.");
      return; // Early return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setIsResourceLoading(true);
        setResourceErrorMessage(null);

        // Default values for supplies
        const foodValue = food === "" ? 0 : parseInt(food, 10);
        const waterValue = water === "" ? 0 : parseInt(water, 10);
        const bedsValue = beds === "" ? 0 : parseInt(beds, 10);
        const savedName = sessionStorage.getItem("userName");

        // Validate the input values
        if (isNaN(foodValue) || isNaN(waterValue) || isNaN(bedsValue)) {
          setResourceErrorMessage(
            "Please enter valid numbers for food, water, and beds."
          );
          setIsResourceLoading(false);
          return; // Early return on validation failure
        }

        try {
          await axios.post("http://127.0.0.1:5000/save_supplies", {
            food: foodValue,
            water: waterValue,
            beds: bedsValue,
            name: savedName,
            latitude: latitude,
            longitude: longitude,
            purpose: purpose,
          });

          setShowResourceModal(false);
          setIsRequestSubmitted(true);
          alert("Resource request submitted successfully.");
          setFood("");
          setWater("");
          setBeds("");
        } catch (error) {
          console.error("Error submitting supplies:", error);
          setResourceErrorMessage(
            "Error submitting supplies. Please try again."
          );
        } finally {
          setIsResourceLoading(false);
        }
      },
      (error) => {
        setErrorMessage("Unable to retrieve location. Please try again.");
        setIsResourceLoading(false);
      }
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 relative">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="absolute top-4 left-4 cursor-pointer"
        onClick={() => router.push("/")}
      >
        <Image
          src="/logo.png"
          alt="Logo"
          width={200}
          height={200}
          className="md:w-32 md:h-32 w-24 h-24 ml-4"
        />
      </motion.div>
      <div className="flex flex-col sm:flex-row justify-center items-center w-full max-w-md gap-8">
      <motion.button
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          onClick={handleSOSClick}
          disabled={isSOSButtonDisabled || isSOSLoading}
          className={`w-52 h-52 rounded-full font-bold text-xl shadow-lg transition-all ${
            isSOSButtonDisabled || isSOSLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-red-500 hover:bg-red-600 active:bg-red-700"
          } text-white`}
        >
          {isSOSLoading
            ? "Connecting..."
            : isSOSButtonDisabled
            ? `Wait ${timeRemaining}s`
            : "Emergency SOS"}
        </motion.button>
        <motion.button
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          onClick={() => setShowResourceModal(true)}
          className="w-52 h-52 rounded-full bg-orange-400 hover:bg-orange-500 active:bg-orange-600 text-white font-bold text-xl shadow-lg"
          disabled={isRequestSubmitted}
        >
          {isRequestSubmitted ? "Pending Approval" : "Request Resources"}
        </motion.button>
      </div>
      {errorMessage && (
        <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center text-red-500 text-lg mt-4"
        >
          {errorMessage}
        </motion.div>
      )}
      <AnimatePresence>
        {showResourceModal && !isRequestSubmitted && (
          <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              transition={{ duration: 0.3 }}
              ref={modalRef}
              className="bg-white p-6 rounded-lg w-full max-w-md"
            >
              <h2 className="text-xl font-bold mb-4">Request Resources</h2>
              {/* New heading for user details */}

              {resourceErrorMessage && (
                <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-center text-red-500 text-sm mb-4"
                >
                  {resourceErrorMessage}
                </motion.div>
              )}
              <form onSubmit={handleRequestSubmit}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="mb-4"
                >
                  <label htmlFor="purpose" className="block mb-2">
                    Who are these resources for?
                  </label>
                  <div className="flex items-center">
                    <input
                      id="purpose"
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      placeholder="Ex: Local Community Center" // Add a placeholder here
                      className="border rounded px-2 py-1 w-full mr-2 placeholder-gray-500" // Add Tailwind class to style the placeholder
                      disabled={isResourceLoading}
                    />
                  </div>
                </motion.div>
                {/* <p>
                  <h3 className="text-lg font-semibold mb-4" >Please specify the quantities of resources you need.</h3>
                </p> */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="mb-4"
                >
                  <label htmlFor="food" className="block mb-2">
                    Food
                  </label>
                  <div className="flex items-center">
                    <input
                      id="food"
                      type="number"
                      value={food}
                      onChange={(e) => setFood(e.target.value)}
                      className="border rounded px-2 py-1 w-full mr-2"
                      disabled={isResourceLoading}
                    />
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="mb-4"
                >
                  <label htmlFor="water" className="block mb-2">
                    Water
                  </label>
                  <div className="flex items-center">
                    <input
                      id="water"
                      type="number"
                      value={water}
                      onChange={(e) => setWater(e.target.value)}
                      className="border rounded px-2 py-1 w-full mr-2"
                      disabled={isResourceLoading}
                    />
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  className="mb-4"
                >
                  <label htmlFor="beds" className="block mb-2">
                    Beds
                  </label>
                  <div className="flex items-center">
                    <input
                      id="beds"
                      type="number"
                      value={beds}
                      onChange={(e) => setBeds(e.target.value)}
                      className="border rounded px-2 py-1 w-full mr-2"
                      disabled={isResourceLoading}
                    />
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                  className="flex justify-end"
                >
                  <button
                    type="button"
                    onClick={() => setShowResourceModal(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded mr-2"
                    disabled={isResourceLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-black hover:bg-gray-500 text-white font-bold py-2 px-4 rounded"
                    disabled={isResourceLoading}
                  >
                    {isResourceLoading ? "Submitting..." : "Submit Request"}
                  </button>
                </motion.div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
