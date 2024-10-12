import React, { useState, useEffect } from 'react';

export default function Card({lat, long, food, bed, water}) {        

    return (
        <div>
            <h2 className="text-xl font-semibold">User Location and Requested Items</h2>
            <div className="">
                <p> Latitude: {lat !== null ? lat : 'Loading...'} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Longitude: {long !== null ? long : 'Loading...'}</p>
            </div>
            <div className="mt-4">
                <p className="">Requested Items:</p>
                <p> Food: {food !== null ? food : 'Loading...'} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Bed: {bed !== null ? bed : 'Loading...'} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Water: {water !== null ? water : 'Loading...'} </p>
            </div>
        </div>
    );
}
