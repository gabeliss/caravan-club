import React from 'react';
import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import '../../styles/routecustomization.css';

// Fix for the missing icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Cache of known locations
const locationCache = {
  "traverseCity": {
    coords: [44.7631, -85.6206],
    displayName: "Traverse City",
    state: "MI"
  },
  "mackinacCity": {
    coords: [45.777, -84.7278],
    displayName: "Mackinac City",
    state: "MI"
  },
  "picturedRocks": {
    coords: [46.5449, -86.3119],
    displayName: "Pictured Rocks",
    state: "MI"
  }
};

// Pin icon with orange color
const pinIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="24" height="36" viewBox="0 0 24 36" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C5.383 0 0 5.383 0 12c0 9 12 24 12 24s12-15 12-24c0-6.617-5.383-12-12-12z" 
        fill="#d4a373"/>
      <circle cx="12" cy="12" r="4" fill="white"/>
    </svg>
  `),
  iconSize: [24, 36],
  iconAnchor: [12, 36],
  popupAnchor: [0, -36],
  className: 'location-pin'
});

const InteractiveMap = ({ segments = [] }) => {
  const locationData = segments.map(segment => ({
    name: locationCache[segment.id]?.displayName || segment.name,
    coords: locationCache[segment.id]?.coords,
    id: segment.id
  })).filter(location => location.coords); // Only include locations we have coordinates for

  return (
    <MapContainer 
      center={[44.3148, -85.6024]}
      zoom={6}
      style={{ height: "400px", width: "100%" }}
      zoomControl={false}
      dragging={false}
      touchZoom={false}
      doubleClickZoom={false}
      scrollWheelZoom={false}
      attributionControl={false}
    >
      <TileLayer
        url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
        maxZoom={20}
      />
      
      {locationData.map((location, index) => (
        <Marker 
          key={location.id}
          position={location.coords}
          icon={pinIcon}
        >
          <Tooltip 
            permanent={true} 
            direction="top" 
            offset={[0, -20]} 
            className="location-label"
          >
            {location.name}
          </Tooltip>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default InteractiveMap;
