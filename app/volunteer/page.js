"use client";

import React, { useState, useRef } from "react";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation"; 

export default function Volunteer({ setShowResourceModal }) {
    const router = useRouter();

    const [hours, setHours] = useState(1);
    const [errorMessage, setErrorMessage] = useState("");
    const modalRef = useRef(null);
    const daysOfWeek = [
        { label: "M", value: 1 },
        { label: "T", value: 2 },
        { label: "W", value: 3 },
        { label: "T", value: 4 },
        { label: "F", value: 5 },
        { label: "S", value: 6 },
        { label: "S", value: 7 }
    ];
    const [selectedDays, setSelectedDays] = useState([]);


    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        if (selectedDays.length === 0) {
            setErrorMessage("Please select a day of the week.");
            return;
        }

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    const savedName = localStorage.getItem("userName");

                    try {
                        await axios.post("http://127.0.0.1:5000/save_volunteer", {
                            longitude: longitude,
                            latitude: latitude,
                            name: savedName,
                            hours: hours,
                            daysOfWeek: selectedDays 

                        });
                        alert("Form Submitted.");
                    } catch (error) {
                        console.error("Error sending form:", error);
                        setErrorMessage("Unable to submit form. Please try again.");
                    }
                },
                (error) => {
                    setErrorMessage("Unable to retrieve location.");
                }
            );
        } else {
            setErrorMessage("Geolocation is not supported by your browser.");
        }
    };

    const handleDayClick = (dayValue) => {
        if (selectedDays.includes(dayValue)) {
            // Unselect the day if it's already selected
            setSelectedDays(selectedDays.filter((day) => day !== dayValue));
        } else {
            // Select the day if it's not already selected
            setSelectedDays([...selectedDays, dayValue]);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="absolute top-4 left-4 cursor-pointer" onClick={() => router.push("/")}>
                <Image
                    src="/logo.png"
                    alt="Logo"
                    width={200}
                    height={200}
                    className="md:w-32 md:h-32 w-24 h-24 ml-4"
                />
            </div>
            <div
                ref={modalRef}
                className="bg-white p-6 rounded-lg w-full max-w-md shadow-md"
            >
                <h2 className="text-xl font-bold mb-4">Volunteer Form</h2>
                {errorMessage && (
                    <div className="text-center text-red-500 text-sm mb-4">
                        {errorMessage}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="water" className="block mb-2">
                            How many hours are you available for
                        </label>
                        <input
                            id="hours"
                            type="number"
                            value={hours}
                            onChange={(e) => setHours(e.target.value)}
                            className="border rounded px-2 py-1 w-full"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-2">Select days of the week:</label>
                        <div className="flex justify-between">
                            {daysOfWeek.map((day) => (
                                <div
                                    key={day.value}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer ${
                                        selectedDays.includes(day.value) ? "bg-gray-500 text-white" : "bg-gray-200"
                                    }`}
                                    onClick={() => handleDayClick(day.value)}
                                >
                                    {day.label}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={() => setShowResourceModal(false)}
                            className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded mr-2"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-black hover:bg-gray-500 text-white font-bold py-2 px-4 rounded"
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
