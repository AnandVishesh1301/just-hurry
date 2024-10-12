import React, { useState, useEffect } from 'react';

export default function Relief() {
    const [coordinates, setCoordinates] = useState({ latitude: null, longitude: null });
    const [supplies, setSupplies] = useState({ food: null, water: null, beds: null });
    const [error, setError] = useState(null);  

    useEffect(() => {
        const fetchCoordinates = async () => {
            try {
                const response = await fetch('http://127.0.0.1:5000/get_coordinates'); // Adjust endpoint as necessary
                if (!response.ok) {
                    throw new Error('Failed to fetch coordinates');
                }
                const data = await response.json();
                setCoordinates({
                    latitude: data.latitude,
                    longitude: data.longitude
                });
            } catch (error) {
                console.error('Error fetching coordinates:', error);
            }
        };

        const fetchSupplies = async () => {
            try {
                const response = await fetch('http://127.0.0.1:5000/get_supplies'); // Adjust endpoint as necessary
                if (!response.ok) {
                    throw new Error('Failed to fetch supplies');
                }
                const data = await response.json();
                console.log('Fetched supplies:', data); // Inspect the data structure
                setSupplies({
                    food: data.food,
                    water: data.water,
                    beds: data.beds
                });
            } catch (error) {
                console.error('Error fetching supplies:', error);
                setError(error.message); // Update state to show the error if any
            }
        };

        fetchCoordinates();
        fetchSupplies();
    }, []);


    return (
        <div>
            <p className="text-3xl font-bold text-center text-blue-600 my-6">
                Relief Team Dashboard
            </p>

            <div className=" flex flex-row flex-wrap justify-center items-center justify-around mr-24 pr-24">
                <div className="p-4 border rounded-md shadow-md w-2/5">
                    <h2 className="text-xl font-semibold">User Location and Requested Items</h2>
                    <div className="">
                        <p> Latitude: {coordinates.latitude !== null ? coordinates.latitude : 'Loading...'} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Longitude: {coordinates.longitude !== null ? coordinates.longitude : 'Loading...'}</p>
                    </div>
                    <div className="mt-4">
                        <p className="">Requested Items:</p>
                        <p> Food: {supplies.food !== null ? supplies.food : 'Loading...'} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Bed: {supplies.beds !== null ? supplies.beds : 'Loading...'} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Water: {supplies.water !== null ? supplies.water : 'Loading...'} </p>
                    </div>
                </div>
                <div className="">
                    <p> More info here</p>
                </div>
            </div>
        </div>
    );
}
