import React, { useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import axios from 'axios';
import 'leaflet/dist/leaflet.css'; // Ensure Leaflet CSS is imported

const MapComponent = () => {
  const [map, setMap] = useState(null);
  const [routingControl, setRoutingControl] = useState(null);
  const [startCity, setStartCity] = useState('');
  const [endCity, setEndCity] = useState('');

  const geocodeCity = async (city) => {
    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: city,
          format: 'json',
          limit: 1,
        },
      });

      console.log(`Geocoding response for ${city}:`, response.data);

      if (response.data.length > 0) {
        const { lat, lon } = response.data[0];
        return [parseFloat(lat), parseFloat(lon)];
      } else {
        alert(`${city} not found`);
        return null;
      }
    } catch (error) {
      alert('Error fetching geolocation data');
      console.error(error);
      return null;
    }
  };

  const handleRoute = async () => {
    if (!startCity || !endCity) {
      alert('Please enter both start and end cities.');
      return;
    }

    if (!map) {
      alert('Map is not initialized.');
      console.log('Map state:', map);
      return;
    }

    const startCoords = await geocodeCity(startCity);
    const endCoords = await geocodeCity(endCity);

    if (startCoords && endCoords) {
      if (routingControl) {
        map.removeControl(routingControl);
      }

      const newRoutingControl = L.Routing.control({
        waypoints: [L.latLng(...startCoords), L.latLng(...endCoords)],
        routeWhileDragging: true,
      }).addTo(map);

      setRoutingControl(newRoutingControl);
    }
  };

  return (
    <div>
      <div>
        <input
          type="text"
          placeholder="Start City"
          value={startCity}
          onChange={(e) => setStartCity(e.target.value)}
        />
        <input
          type="text"
          placeholder="End City"
          value={endCity}
          onChange={(e) => setEndCity(e.target.value)}
        />
        <button onClick={handleRoute}>Get Directions</button>
      </div>
      <MapContainer
        whenCreated={(mapInstance) => {
          setMap(mapInstance);
          console.log('Map initialized:', mapInstance); 
        }}
        center={[20.5937, 78.9629]}
        zoom={4}
        style={{ height: '100vh', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
        />
      </MapContainer>
    </div>
  );
};

export default MapComponent;
