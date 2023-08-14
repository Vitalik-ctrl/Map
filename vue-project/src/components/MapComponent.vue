<template>
    <div class="map-container">
        <l-map ref="mapRef" :zoom="zoom" :center="center" :options="mapOptions" @click="handleMapClick">
            <l-tile-layer :url="url" :attribution="attribution" />
            <l-control class="custom-button">
                <p @click="showAllMarkers">📍</p>
            </l-control>
            <l-marker v-for="(marker, index) in markers" :key="index" :lat-lng="marker.latlng">
                <l-popup>
                    <div class="popup-content">
                        <div class="popup-text">{{ marker.address }}</div>
                        <button class="delete-button" @click="removeMarker(index)">Delete</button>
                    </div>
                </l-popup>
            </l-marker>
        </l-map>
    </div>
</template>
  

<script>

import { latLng } from "leaflet";
import L from 'leaflet';
import 'pelias-leaflet-plugin';
import 'leaflet/dist/leaflet.css';
import "leaflet-geosearch/assets/css/leaflet.css";
import { LMap, LTileLayer, LMarker, LPopup, LControl } from "@vue-leaflet/vue-leaflet";
import { createMarker, getAllMarkersLocations, hardlyDeleteMarkerFromDb } from '../service/MapService';
import 'leaflet-geosearch/dist/geosearch.css';
import 'pelias-leaflet-geocoder/dist/pelias-leaflet-geocoder.css';
import 'leaflet-geosearch/dist/geosearch.umd.js';

import axios from 'axios';

export default {
    name: "MapComponent",
    components: {
        LMap,
        LTileLayer,
        LMarker,
        LPopup,
        LControl,
    },

    props: {
        initialCenter: Object,
    },

    data() {
        return {
            zoom: 13,
            center: this.initialCenter || latLng(47.41322, -1.219482),
            url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
            markers: [],
            mapOptions: {
                'Accept-Language': 'cs',
                zoomControl: false,
                zoomSnap: 0.2,
                minZoom: 4,
            },
        };
    },

    methods: {
        async handleMapClick(event) {
            const latlng = event.latlng;
            const newMarker = { latlng };
            await this.loadText(latlng, newMarker);
            console.log(">>> Marker by click was added");
            this.markers.push(newMarker);
            await createMarker(newMarker);
        },

        async handleSearchResult(latlng) {
            const newMarker = { latlng };
            await this.loadText(latlng, newMarker);
            console.log(">>> Marker by search was added");
            this.markers.push(newMarker);
            await createMarker(newMarker);
        },

        async loadText(coords, marker) {
            const address = await this.getAddressFromCoords(coords);
            marker.address = address;
        },

        async getAddressFromCoords(coords) {
            try {
                const apiKey = 'ge-ca00d373c6ca5316';
                const url = `https://api.geocode.earth/v1/reverse?point.lat=${coords.lat}&point.lon=${coords.lng}&api_key=${apiKey}`;
                const response = await axios.get(url);
                const data = response.data;

                if (data && data.features && data.features.length > 0) {
                    const address = data.features[0].properties.label;
                    console.log(address);
                    return address;
                } else {
                    return 'Address not found';
                }
            } catch (error) {
                console.error('Error fetching address:', error);
                return 'Address not found';
            }
        },

        removeMarker(index) {
            hardlyDeleteMarkerFromDb(this.markers[index].address);
            this.markers.splice(index, 1);

        },

        async showAllMarkers() {
            if (!this.markers.length) {
                let markers = await getAllMarkersLocations();
                console.log(markers);
                markers = markers.map(marker => ({
                    latlng: latLng(marker.lat, marker.lng),
                    address: marker.address
                }));
                console.log(markers);
                this.markers = this.markers.concat(markers);
                console.log(this.markers);
            } else {
                this.markers.length = 0;
            }
        },
    },

    mounted() {
        setTimeout(() => {

            const map = this.$refs.mapRef.leafletObject;

            if (typeof map === "undefined") return;

            var options = {
                placeholder: 'Search places...',
                bounds: false,
                markers: false,
            };

            const search = L.control.geocoder('ge-ca00d373c6ca5316', options).addTo(map);
            L.control.zoom({ position: 'bottomright' }).addTo(map);

            search.on("select", (event) => {
                console.log(event);
                this.handleSearchResult(event.latlng);
            });

        }, 300);
    },

};
</script>
  
<style scoped>
.delete-button {
    background-color: red;
    color: white;
    border: none;
    border-radius: 5px;
    padding: 5px 10px;
    cursor: pointer;
}

.delete-button:hover {
    background-color: rgb(170, 10, 10);
}

.popup-content {
    margin: 20px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    padding: 5px;
}

.popup-text {
    font-size: 14px;
    color: #333;
    text-align: center;
    margin-bottom: 10px;
}

.map-container {
    height: 600px;
    width: 800px;
    border: 4px gray solid;
}

.custom-button {
    cursor: pointer;
    user-select: none;
    background: rgb(255, 255, 255);
    text-align: center;
    padding-bottom: 5px;
    height: 30px;
    width: 30px;
    border: 1px solid #aaa;
    border-radius: 4px;
}

.custom-button:hover {
    background: rgb(232, 232, 232);
}
</style>
