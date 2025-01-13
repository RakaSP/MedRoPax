import React from 'react'
import '../../styles/index.scss'
import { Outlet } from 'react-router-dom'

const Packer = () => {
  return (
    <div className="ml-[260px] max-h-full h-screen">
      <Outlet />
    </div>
  )
}

export default Packer
