import React, { useState, useEffect } from 'react'
import { NavLink, useLocation, useParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBoxesPacking, faTruck } from '@fortawesome/free-solid-svg-icons'
import styles from '../../../styles/style'

const PackerNav = () => {
  const [activeNavItemIndex, setActiveNavItemIndex] = useState(null)
  const location = useLocation()

  const handleNavItemClick = (index) => {
    setActiveNavItemIndex(index === activeNavItemIndex ? null : index)
  }

  let { vehicleId, cardboardId } = useParams()
  vehicleId = Number(vehicleId)
  cardboardId = Number(cardboardId)
  const packingInformation = JSON.parse(
    localStorage.getItem('result')
  ).packing_information

  const vehicleList = JSON.parse(localStorage.getItem('problem')).vehicle_list

  let indexOfVehicle = vehicleList.findIndex(
    (detail) => detail.id === vehicleId
  )

  const cardboardItems = packingInformation[indexOfVehicle]?.filter(
    (item) => item.type === 'cardboard'
  )

  const links = [
    {
      title: 'Vehicle',
      link: `/packer/vehicle/${vehicleList[0].id}`,
      icon: faTruck,
    },
    {
      title: 'Cardboard',
      link: `/packer/vehicle/${vehicleList[0].id}/cardboard/${cardboardItems[0]?.id}`,
      icon: faBoxesPacking,
    },
  ]

  const handleSelectVehicle = (e) => {
    const selectedVehicleId = e.target.value

    const isOnCardboardRoute =
      location.pathname.includes('/packer/vehicle/') &&
      location.pathname.includes('/cardboard/')

    if (!isOnCardboardRoute) {
      window.location.href = `/packer/vehicle/${selectedVehicleId}`
    } else {
      const indexOfVehicle = vehicleList.findIndex(
        (detail) => detail.id === selectedVehicleId
      )
      const cardboardId = packingInformation[indexOfVehicle]?.[0]?.id

      window.location.href = `/packer/vehicle/${selectedVehicleId}/cardboard/${cardboardId}`
    }
  }

  const handleSelectCardboard = (e) => {
    const selectedCardboardId = e.target.value
    window.location.href = `/packer/vehicle/${vehicleId}/cardboard/${selectedCardboardId}`
  }

  return (
    <div className="flex flex-col justify-between flex-1">
      <nav className="mt-3 px-[30px]">
        {links.map((item, index) => (
          <React.Fragment key={item.title}>
            <NavLink
              exact="true"
              className={`${styles.sidebar_item} flex justify-between flex-row`}
              activeClassName="active"
              to={item.link}
              onClick={(e) => {
                if (item.title === 'Cardboard' && cardboardItems.length === 0) {
                  e.preventDefault()
                  alert('⚠ No cardboard inside the selected vehicle!')
                } else {
                  handleNavItemClick(index)
                }
              }}
            >
              <div>
                <FontAwesomeIcon
                  icon={item.icon}
                  className="mr-[10px] w-[25px]"
                />
                <span>{item.title}</span>
              </div>
            </NavLink>
          </React.Fragment>
        ))}
      </nav>

      <div className="flex flex-col">
        {location.pathname.includes('/packer/vehicle') && (
          <>
            <label htmlFor="vehicleDropdown">Choose Vehicle:</label>
            <select
              id="vehicleDropdown"
              name="vehicleOptions"
              value={vehicleId}
              onChange={handleSelectVehicle}
            >
              {packingInformation.map((option, index) => (
                <option value={vehicleList[index].id}>
                  Vehicle: {vehicleList[index].id}
                </option>
              ))}
            </select>
          </>
        )}

        {location.pathname.includes('/packer/vehicle/') &&
          location.pathname.includes('/cardboard') && (
            <>
              <label htmlFor="cardboardDropdown">Choose Cardboard:</label>
              <select
                id="cardboardDropdown"
                name="cardboardOptions"
                value={cardboardId}
                onChange={handleSelectCardboard}
              >
                {packingInformation[indexOfVehicle].map(
                  (cardboardPackingInfo) => (
                    <option value={cardboardPackingInfo.id}>
                      Cardboard: {cardboardPackingInfo.id}
                    </option>
                  )
                )}
              </select>
            </>
          )}
      </div>
    </div>
  )
}

export default PackerNav
