import axios from 'axios';
import Marker from '../models/marker.js';

const backendBaseUrl = 'http://localhost:3001';

export const createMarker = async (marker) => {
    try {
        console.log(marker);
        const markerObject = new Marker(marker.latlng.lat, marker.latlng.lng, marker.address);
        const response = await axios.post(`${backendBaseUrl}/markers`, markerObject);
        console.log(response.data);
    } catch (error) {
        console.error('Error creating marker:', error);
    }
};

export const getAllMarkersLocations = async () => {
    try {
        const response = await axios.get(`${backendBaseUrl}/markers`);
        return response.data;
    } catch (error) {
        console.error('Error getting all markers locations: ', error);
    }
};

export const hardlyDeleteMarkerFromDb = async (address) => {
    try {
        const encodedAddress = encodeURIComponent(address);
        await axios.delete(`${backendBaseUrl}/markers/${encodedAddress}`);
    } catch (error) {
        console.error('Error deleting marker:', error);
    }
};