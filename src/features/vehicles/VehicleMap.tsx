import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import 'leaflet/dist/leaflet.css'
import type { Vehicle } from '../../types/mbta.ts'

const pin = L.icon({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

export default function VehicleMap({ vehicle }: { vehicle: Vehicle }) {
  if (vehicle.lat == null || vehicle.lng == null) {
    return (
      <p className="rounded-md bg-stone-100 px-3 py-8 text-center text-sm text-muted">
        No position available for this vehicle.
      </p>
    )
  }

  const pos: [number, number] = [vehicle.lat, vehicle.lng]

  return (
    <MapContainer
      center={pos}
      zoom={15}
      className="vehicle-map"
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={pos} icon={pin}>
        <Popup>
          {vehicle.label}
          {vehicle.route?.shortName ? ` · ${vehicle.route.shortName}` : ''}
        </Popup>
      </Marker>
    </MapContainer>
  )
}
