import React from 'react'

const MapPlaceholder = ({ coords }) => {
  const origin = coords[0]
  const destination = coords[coords.length - 1]
  const waypoints = coords.slice(1, -1)

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
        src={`https://www.google.com/maps/embed/v1/directions?center=${origin}&zoom=11&origin=${origin}&destination=${destination}${
          waypoints.length > 0 ? `&waypoints=${waypointString}` : ''
        }&mode=driving&key=AIzaSyCJw4aZ96JtpPHgj8lKyrQY5OBnWTREyO4`}
      ></iframe>
    </div>
  )
}

export default MapPlaceholder
