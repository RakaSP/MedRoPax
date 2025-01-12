import React, { useState, useEffect } from 'react'
import { NavLink, useNavigate, useLocation, useParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBoxesPacking,
  faTruck,
  faWarehouse,
} from '@fortawesome/free-solid-svg-icons'
import styles from '../../../styles/style'

const PackerNav = () => {
  const [activeNavItemIndex, setActiveNavItemIndex] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  const handleNavItemClick = (index) => {
    setActiveNavItemIndex(index === activeNavItemIndex ? null : index)
  }

  const [selectedVehicle, setSelectedVehicle] = useState()
  const [selectedCardboard, setSelectedCardboard] = useState()

  const links = [
    {
      title: 'Vehicle',
      link: '/packer/vehicle/1',
      icon: faTruck,
    },
    {
      title: 'Cardboard',
      link: '/packer/cardboard/1',
      icon: faBoxesPacking,
    },
  ]

  const packingInformation = JSON.parse(
    localStorage.getItem('result')
  ).packing_information
  const vehicleList = JSON.parse(localStorage.getItem('problem')).vehicle_list
  const { vehicle_id, cardboard_id } = useParams()

  const handleSelectVehicle = (e) => {
    const selectedVehicleId = e.target.value
    navigate(`/packer/vehicle/${selectedVehicleId}`)
  }

  const handleSelectCardboard = (e) => {
    const selectedCardboardId = e.target.value
    navigate(`/packer/vehicle/${vehicle_id}/cardboard/${selectedCardboardId}`)
  }

  useEffect(() => {
    // Set selected vehicle and cardboard based on the URL
    if (vehicle_id) setSelectedVehicle(vehicle_id)
    if (cardboard_id) setSelectedCardboard(cardboard_id)
  }, [vehicle_id, cardboard_id])

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
              onClick={() => handleNavItemClick(index)}
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
              value={selectedVehicle}
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
                value={selectedCardboard}
                onChange={handleSelectCardboard}
              >
                {packingInformation[vehicle_id - 1].map(
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
