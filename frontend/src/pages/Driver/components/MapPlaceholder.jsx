import React from 'react'

const MapPlaceholder = ({ origin, destination }) => {
  return (
    <div className="h-full w-full">
      <iframe
        width="100%"
        height="100%"
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        src={`https://www.google.com/maps/embed/v1/directions?key=AIzaSyCJw4aZ96JtpPHgj8lKyrQY5OBnWTREyO4
    &origin=${origin}
    &destination=${destination}
    &mode=driving`}
      ></iframe>
    </div>
  )
}

export default MapPlaceholder
