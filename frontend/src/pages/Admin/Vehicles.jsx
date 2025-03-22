import React, { useState, useEffect } from 'react'
import styles from '../../styles/style'
import '../../styles/index.scss'
import { icecube } from '../../assets/EmployeePage'
import { truck2d } from '../../assets/EmployeePage'
const Vehicles = () => {
  const [activeStatus, setActiveStatus] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [filteredVehiclesData, setFilteredVehiclesData] = useState([])
  const [searchValue, setSearchValue] = useState('')
  const itemsPerPage = 16
  let vehicles =
    JSON.parse(localStorage.getItem('problem')).vehicle_list || null
  const packingInformation = JSON.parse(localStorage.getItem('mappedData'))

  vehicles = vehicles.map((vehicle, index) => {
    const length = packingInformation[index].length
    if (length === 0) {
      vehicle.status = 'available'
    } else {
      vehicle.status = 'in transit'
    }

    let totalWeight = 0

    packingInformation[index].map((order) => {
      order.item_list.map((item) => {
        totalWeight += item.weight
      })
    })

    vehicle.total_weight = totalWeight / 1000

    return vehicle
  })

  const handleListClick = (index) => {
    setActiveStatus(index)
    setCurrentPage(1)
  }

  const handleInputChange = (event) => {
    setSearchValue(event.target.value)
  }

  useEffect(() => {
    let filteredData = vehicles

    if (searchValue !== '') {
      filteredData = filteredData.filter((vehicle) =>
        vehicle.id.toString().includes(searchValue)
      )
    }

    setFilteredVehiclesData(filteredData)
  }, [searchValue])

  useEffect(() => {
    if (activeStatus === 0) {
      setFilteredVehiclesData(vehicles)
    } else {
      const statusMapping = {
        1: 'available',
        2: 'in transit',
      }
      const filteredData = vehicles.filter(
        (item) =>
          item.status.toLowerCase() ===
          statusMapping[activeStatus].toLowerCase()
      )
      setFilteredVehiclesData(filteredData)
    }
  }, [activeStatus])

  const renderCardRow = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentVehicles = filteredVehiclesData.slice(startIndex, endIndex)

    return (
      <div className="grid justify-start mb-4 gap-4 grid-cols-4 ">
        {currentVehicles.map((vehicle) => (
          <div
            className="relative py-4 px-3 rounded-md border-2 border-gray-200 shadow-md bg-bg_card text-lg"
            key={vehicle.id}
          >
            <div className="flex flex-row justify-between mb-1 font-poppins">
              <div className="font-[500]">
                <span className="font-semibold"> {vehicle.id}</span>
              </div>
              <div className=" font-semibold text-[green]">
                {vehicle.status}
              </div>
            </div>
            <div className="flex flex-row justify-between">
              <div className="basis-2/5 flex flex-col">
                <div>
                  <div className="text-text_primary text-sm">Weight (KG)</div>
                  <div className="font-semibold">
                    {vehicle.total_weight.toFixed(2)}/
                    {vehicle.box_max_weight.toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="basis-3/5 flex items-center justify-center relative">
                <img src={truck2d} alt="img" className="object-fit" />
                {vehicle.refrigerated && (
                  <img
                    src={icecube}
                    alt=""
                    className="absolute top-1/3 left-1/2 w-16 -translate-y-1/2"
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const totalPages = Math.ceil(filteredVehiclesData.length / itemsPerPage)

  return (
    <div className="relative py-[10px] px-10">
      <h4 className={`${styles.heading4} mt-7 text-text_primary`}>
        {filteredVehiclesData.length} Vehicles
      </h4>
      <div className="mt-5 bg-bg_card rounded-xl pt-8 px-4 pb-2 shadow-lg">
        <div className="flex flex-row items-center justify-between mb-4">
          <ul className="flex flex-row">
            {[
              { id: 0, status: 'All Vehicles' },
              { id: 1, status: 'Available' },

              { id: 3, status: 'In Transit' },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-highlight bg-opacity-20 hover:bg-opacity-100 rounded-md mx-2 p-2 text-sm text-highlight w-[120px] text-center font-semibold hover:text-[#fff] cursor-pointer"
                onClick={() => handleListClick(index)}
              >
                {item.status}
              </div>
            ))}
          </ul>
          <form onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              value={searchValue}
              onChange={handleInputChange}
              placeholder="Search Vehicle ID"
              className="font-medium border-2 rounded-full px-4 py-1 outline-none"
            />
          </form>
        </div>

        {renderCardRow()}

        <div className="flex justify-center mt-4">
          <ul className="flex">
            {Array.from({ length: totalPages }, (_, index) => (
              <li
                key={index + 1}
                onClick={() => setCurrentPage(index + 1)}
                className={`mx-1 cursor-pointer w-[32px] h-[32px] flex items-center justify-center rounded text-sm font-semibold ${
                  currentPage === index + 1
                    ? 'bg-highlight text-white'
                    : 'border-gray-200 border text-highlight hover:bg-highlight hover:text-white'
                }`}
              >
                {index + 1}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Vehicles
