import React from 'react'
import '../../styles/index.scss'
import { Outlet } from 'react-router-dom'
import { shipments2 } from '../../constants'

const Driver = () => {
  const shipment = shipments2[0]
  return (
    <div className="ml-[260px] h-full">
      <Outlet context={shipment} />
    </div>
  )
}

export default Driver
