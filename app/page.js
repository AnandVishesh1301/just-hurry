"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ChatBot from "./components/ChatBot";

export default function Relief() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const savedName = sessionStorage.getItem("userName");
    if (savedName) {
      setName(savedName);
      setSubmitted(true);
    }
  }, []);

  const handleTeamClick = () => {
    router.push("/volunteer");
  };

  const handleClientClick = () => {
    router.push("/user");
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      sessionStorage.setItem("userName", name);
      setSubmitted(true);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div
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
      </div>
      {!submitted ? (
        <form
          onSubmit={handleNameSubmit}
          className="mb-6 flex flex-col items-center"
        >
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="border border-gray-300 rounded-lg px-4 py-2 w-64 mb-2"
            required
          />
          <div className="mt-auto">
            <button
              type="submit"
              className="w-32 h-10 mt-4 text-white font-bold rounded-lg shadow-lg bg-red-500 hover:bg-red-600 active:bg-red-700 transition duration-300"
            >
              Submit
            </button>
          </div>
        </form>
      ) : (
        <div className="flex flex-col gap-6 items-center">
          <h1 className="text-3xl font-bold mb-8 max-w-lg text-center">
            Welcome, {name}!
          </h1>
          <button
            onClick={handleClientClick}
            className="w-64 h-16 text-white font-bold text-xl rounded-lg shadow-lg bg-red-500 hover:bg-red-600 active:bg-red-700 transition duration-300"
          >
            Get Help
          </button>
          <button
            onClick={handleTeamClick}
            className="w-64 h-16 text-white font-bold text-xl rounded-lg shadow-lg bg-orange-400 hover:bg-orange-500 active:bg-orange-600 transition duration-300"
          >
            Volunteer
          </button>
        </div>
      )}
      <ChatBot />
    </div>
  );
}
