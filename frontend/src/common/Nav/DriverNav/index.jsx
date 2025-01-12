import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faHouse,
  faAngleRight,
  faAngleDown,
  faBoxesPacking,
} from '@fortawesome/free-solid-svg-icons'
import styles from '../../../styles/style'

const AdminNav = () => {
  const [activeNavItemIndex, setactiveNavItemIndex] = useState(null)
  const navigate = useNavigate()
  const handleNavItemClick = (index) => {
    setactiveNavItemIndex(index === activeNavItemIndex ? null : index)
  }

  const links = [
    {
      title: 'Dashboard',
      link: '/driver/1',
      icon: faHouse,
      subLinks: [],
    },
    {
      title: 'Report',
      link: '/driver/report',
      icon: faBoxesPacking,
      subLinks: [],
    },
  ]
  const vehicleNum = JSON.parse(localStorage.getItem('result')).num_vehicle
  console.log(vehicleNum)

  const handleSelectVehicle = (e) => {
    const selectedValue = e.target.value
    navigate(`/driver/${selectedValue}`)
  }

  return (
    <>
      <nav className="mt-3 flex flex-col justify-between h-full px-[30px]">
        <div>
          {links.map((item, index) => (
            <React.Fragment key={item.title}>
              <NavLink
                exact="true"
                className={`${styles.sidebar_item} flex justify-between flex-row`}
                activeclassname="active"
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
                {item.subLinks.length > 0 ? (
                  <div>
                    <FontAwesomeIcon
                      className="text-right"
                      icon={
                        activeNavItemIndex === index
                          ? faAngleDown
                          : faAngleRight
                      }
                    />
                  </div>
                ) : (
                  ''
                )}
              </NavLink>
              <ul>
                {item.subLinks.length > 0 && index === activeNavItemIndex
                  ? item.subLinks.map((subLinkItem, index) => (
                      <NavLink
                        exact="true"
                        className={`${
                          styles.sidebar_item_sublink
                        } ml-[45px] pl-2 border-l-2 border-text_primary hover:border-highlight ${
                          index === 0 ? 'mt-2' : ''
                        } ${index === item.subLinks.length - 1 ? 'mb-2' : ''}`}
                        activeclassname="active"
                        to={subLinkItem.link}
                      >
                        {subLinkItem.title}
                      </NavLink>
                    ))
                  : null}
              </ul>
            </React.Fragment>
          ))}
        </div>
        <div className="flex flex-col">
          <label for="myDropdown">Choose an option:</label>
          <select id="myDropdown" name="options" onChange={handleSelectVehicle}>
            {[...Array(vehicleNum)].map((_, index) => (
              <option key={index} value={index + 1}>
                Vehicle: {index + 1}
              </option>
            ))}
          </select>
        </div>
      </nav>
    </>
  )
}

export default AdminNav
