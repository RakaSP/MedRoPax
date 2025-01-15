import React from 'react'

const MapPlaceholder = ({ coords }) => {
  // Extract the origin, destination, and waypoints
  const origin = coords[0] // First coordinate is the origin
  const destination = coords[coords.length - 1] // Last coordinate is the destination
  const waypoints = coords.slice(1, -1) // Everything in between are waypoints

  // Join waypoints as a pipe-separated string of "lat,lng"
  const waypointString = waypoints
    .map(([lat, lng]) => `${lat},${lng}`)
    .join('|')

  return (
    <div className="h-full w-full">
      <iframe
        width="100%"
        height="100%"
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        src={`https://www.google.com/maps/embed/v1/directions?origin=${origin}&destination=${destination}${
          waypoints.length > 0 ? `&waypoints=${waypointString}` : ''
        }&mode=driving&key=AIzaSyCJw4aZ96JtpPHgj8lKyrQY5OBnWTREyO4`}
      ></iframe>
    </div>
  )
}

export default MapPlaceholder
