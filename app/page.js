"use client";

import React from "react";
import { useRouter } from "next/navigation"; // Import from next/navigation for app directory structure
import Image from "next/image";

export default function Relief() {
    const router = useRouter();

    const handleTeamClick = () => {
        // Redirect to the team page
        router.push("/team");
    };

    const handleClientClick = () => {
        // Redirect to the client page
        router.push("/user");
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="absolute top-4 left-4 cursor-pointer" onClick={() => router.push("/")}>
                <Image
                    src="/logo.png"
                    alt="Logo"
                    width={200}
                    height={200}
                    className="md:w-32 md:h-32 w-24 h-24 ml-4"
                />
            </div>
            <h1 className="text-3xl font-bold mb-8">Choose Your Role</h1>
            <div className="flex flex-col gap-6">
                <button
                    onClick={handleClientClick}
                    className="w-64 h-16 text-white font-bold text-xl rounded-lg shadow-lg bg-red-500 hover:bg-red-600 active:bg-red-700 transition duration-300"
                >
                    Get Help!
                </button>
                <button
                    onClick={handleTeamClick}
                    className="w-64 h-16 text-white font-bold text-xl rounded-lg shadow-lg bg-orange-400 hover:bg-orange-500 active:bg-orange-600 transition duration-300"
                >
                    Volunteer
                </button>
            </div>
        </div>
    );
}
