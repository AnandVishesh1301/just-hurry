"use client";

import React, { useState, useRef } from "react";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function Volunteer() {
  const router = useRouter();

  const [hours, setHours] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const modalRef = useRef(null);
  const daysOfWeek = [
    { label: "M", value: 1 },
    { label: "T", value: 2 },
    { label: "W", value: 3 },
    { label: "T", value: 4 },
    { label: "F", value: 5 },
    { label: "S", value: 6 },
    { label: "S", value: 7 },
  ];
  const [selectedDays, setSelectedDays] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedDays.length === 0) {
      setErrorMessage("Please select a day of the week.");
      return;
    }

    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const savedName = sessionStorage.getItem("userName");

          try {
            await axios.post("http://127.0.0.1:5000/save_volunteer", {
              longitude: longitude,
              latitude: latitude,
              name: savedName,
              hours: hours,
              daysOfWeek: selectedDays,
            });
            alert("Your response has been recorded.");
            setLoading(false);
            router.push("/");
          } catch (error) {
            console.error("Error sending form:", error);
            setErrorMessage("Unable to submit form. Please try again.");
            setLoading(false);
          }
        },
        (error) => {
          setErrorMessage("Unable to retrieve location.");
          setLoading(false);
        }
      );
    } else {
      setErrorMessage("Geolocation is not supported by your browser.");
    }
  };

  const handleDayClick = (dayValue) => {
    if (selectedDays.includes(dayValue)) {
      setSelectedDays(selectedDays.filter((day) => day !== dayValue));
    } else {
      setSelectedDays([...selectedDays, dayValue]);
    }
  };

  return (
    <motion.div 
      className="flex items-center justify-center min-h-screen bg-gray-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute top-4 left-4 cursor-pointer"
        onClick={() => router.push("/")}
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ scale: 1.1 }}
      >
        <Image
          src="/logo.png"
          alt="Logo"
          width={200}
          height={200}
          className="md:w-32 md:h-32 w-24 h-24 ml-4"
        />
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <motion.h2
            className="text-2xl font-bold"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Submitting...
          </motion.h2>
        </div>
      ) : (
        <motion.div
          ref={modalRef}
          className="bg-white p-6 rounded-lg w-full max-w-md shadow-md m-4"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-xl font-bold mb-4">Volunteer Form</h2>
          {errorMessage && (
            <motion.div
              className="text-center text-red-500 text-sm mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {errorMessage}
            </motion.div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="hours" className="block mb-2">
                How many hours are you available for?
              </label>
              <motion.input
                id="hours"
                type="number"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="border rounded px-2 py-1 w-full"
                whileFocus={{ scale: 1.05 }}
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">Select days of the week:</label>
              <div className="flex justify-between">
                {daysOfWeek.map((day) => (
                  <motion.div
                    key={day.value}
                    className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer ${
                      selectedDays.includes(day.value)
                        ? "bg-gray-500 text-white"
                        : "bg-gray-200"
                    }`}
                    onClick={() => handleDayClick(day.value)}
                    whileTap={{ scale: 0.9 }}
                  >
                    {day.label}
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="flex justify-end">
              <motion.button
                type="button"
                onClick={() => router.push("/")}
                className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded mr-2"
                whileHover={{ scale: 1.05 }}
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                className="bg-black hover:bg-gray-500 text-white font-bold py-2 px-4 rounded"
                whileHover={{ scale: 1.05 }}
              >
                Submit
              </motion.button>
            </div>
          </form>
        </motion.div>
      )}
    </motion.div>
  );
}
