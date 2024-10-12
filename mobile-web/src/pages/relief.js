import React, { useState } from 'react';

export default function Relief() {


    return (
        <div>
            <p className="text-3xl font-bold text-center text-blue-600 my-6">
                Relief Team Dashboard
            </p>

            <div className=" flex flex-row flex-wrap justify-center items-center justify-around mr-24 pr-24">
                <div className="p-4 border rounded-md shadow-md w-2/5">
                    <h2 className="text-xl font-semibold">User Location and Requested Items</h2>
                    <div className="">
                        <p> Latitude: 10 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Longitude: 10</p>
                    </div>
                    <div className="mt-4">
                        <p className="">Requested Items:</p>
                        <p> Food:  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Bed: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Water: </p>
                    </div>
                </div>
                <div className="">
                    <p> More info here</p>
                </div>
            </div>
        </div>
    );
}
