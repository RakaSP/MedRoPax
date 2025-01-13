import React from 'react'
import { useOutletContext, useParams } from 'react-router-dom'
import ReactStars from 'react-rating-stars-component'
import { truck3d } from '../../assets/EmployeePage'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faPhone, faCheck } from '@fortawesome/free-solid-svg-icons'
import MapPlaceholder from './components/MapPlaceholder'

const Dashboard = () => {
  const shipment = useOutletContext()
  let { id } = useParams()
  id = Number(id)
  const indexOfVehicle = JSON.parse(
    localStorage.getItem('problem')
  ).vehicle_list.findIndex((vehicle) => vehicle.id === id)
  const noRoute = !(
    Array.isArray(
      JSON.parse(localStorage.getItem('result'))?.tour_list?.[indexOfVehicle]
    ) &&
    JSON.parse(localStorage.getItem('result'))?.tour_list?.[indexOfVehicle]
      .length > 0
  )

  const vehicleDetails = JSON.parse(localStorage.getItem('problem'))
    .vehicle_list[indexOfVehicle]
  const depotCoord = JSON.parse(localStorage.getItem('problem')).depot_coord
  const orderList = JSON.parse(localStorage.getItem('problem')).order_list
  const distanceMatrix = JSON.parse(
    localStorage.getItem('problem')
  ).distance_matrix

  let data = JSON.parse(localStorage.getItem('mappedData'))[indexOfVehicle]

  let totalWeight = 0
  data.map((order) => {
    order.item_list.map((item) => {
      totalWeight += item.weight
    })
  })
  totalWeight = totalWeight / 1000
  console.log(totalWeight)

  let origin, destination
  for (let i = 0; i < data.length; i++) {
    if (data[i].delivered === false) {
      if (i === 0) {
        origin = depotCoord
      } else {
        origin = data[i - 1].coord
      }
      destination = data[i].coord
      break
    }
  }

  const driverMileage = Math.floor(Math.random() * (10000 - 5000 + 1)) + 5000

  function generateRandomPlate() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const randomLetter = () =>
      letters.charAt(Math.floor(Math.random() * letters.length))

    const region = randomLetter() + randomLetter()
    const numbers = Math.floor(1000 + Math.random() * 9000)
    const suffix = randomLetter() + randomLetter()

    return `${region} ${numbers} ${suffix}`
  }

  const rating = (Math.random() * (5 - 4) + 4).toFixed(2)

  const handleClickArrive = (index) => {
    let mappedData = JSON.parse(localStorage.getItem('mappedData'))
    mappedData[indexOfVehicle]?.[index] &&
      (mappedData[indexOfVehicle][index].delivered = true)

    localStorage.setItem('mappedData', JSON.stringify(mappedData))
    window.location.reload()
  }

  let distanceList = []
  let orderIndexList = []

  data.map((order, index) => {
    const orderIndex = orderList.findIndex((orderA) => orderA.id === order.id)
    orderIndexList.push(orderIndex)
    distanceList.push(
      index === 0
        ? distanceMatrix[0][orderIndex + 1]
        : distanceMatrix[orderIndexList[index - 1] + 1][
            orderIndexList[index] + 1
          ]
    )
  })
  const totalDistance = distanceList.reduce(
    (total, distance) => total + distance,
    0
  )
  return (
    <div className="h-full min-h-[100vh] w-full flex flex-row">
      <div className="p-[10px] px-10 w-[40%] max-h-full h-screen overflow-y-scroll">
        <div className="w-full flex flex-row justify-between items-center">
          <div className="flex flex-col">
            <h4 className="font-poppins text-text_primary font-bold text-xl">
              driver xyz
              {/* need repair */}
            </h4>
            <p className="font-poppins text-text_primary opacity-60 text-base font-semibold">
              Driver
            </p>
          </div>
          <div className="h-[128px] flex flex-col justify-center">
            <ReactStars
              count={5}
              value={Number(rating)}
              size={24}
              isHalf={true}
              edit={false}
              activeColor="#ffd700"
            />
            <div className="font-poppins">
              <p className=" text-sm text-text_primary font-medium">
                Ratings: {rating}
              </p>
              <p className=" text-sm text-text_primary font-medium">
                {driverMileage.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}{' '}
                km
              </p>
            </div>
          </div>
        </div>
        <hr />
        {noRoute && (
          <>
            <p>Driver is currently no assigned to any delivery</p>
          </>
        )}
        {!noRoute && (
          <>
            <div className="w-full font-poppins text-text_primary text-lg font-semibold my-4 text-center">
              Assigned to Delivery ID {shipment.id}
            </div>
            <hr />
            <div className="w-full flex flex-row mt-4 gap-4">
              <img
                src={truck3d}
                alt=""
                className="h-20 w-[80px] -scale-x-100 bg-white rounded-lg shadow-lg border-gray-200 border"
              />
              <div className="flex flex-col">
                <h5 className="font-poppins tet-text_primary text-base font-bold mt-2">
                  {generateRandomPlate()}
                </h5>
                <p className="font-poppins text-text_primary text-sm font-semibold">
                  {/* need update */}
                  {totalWeight.toFixed(2)}/
                  {vehicleDetails.box_max_weight.toFixed(2)} kg,{' '}
                  {totalDistance.toFixed(2)} km
                </p>
              </div>
            </div>
            <div className="mt-8 pb-8">
              <div className="w-full flex flex-row items-stretch mb-4 h-full">
                <div className="flex flex-row mr-4 pt-2 w-[80px] justify-between relative">
                  <p className="text-text_primary text-xs opacity-60 font-semibold">
                    <span className="block">09:00</span>
                    <span className="block mt-1 whitespace-nowrap">(0 km)</span>
                  </p>
                  <div className="w-4 h-4 bg-highlight rounded-full flex justify-center">
                    <div className="absolute w-1 h-[calc(100%+20px)] bg-highlight z-10"></div>
                  </div>
                </div>
                <div className="w-full bg-bg_card rounded-lg shadow-lg p-4">
                  <div className="w-full flex flex-row justify-between items-center font-poppins">
                    <h5 className="text-text_primary font-semibold text-lg">
                      Depot
                    </h5>
                    <div className="rounded-full text-green-500 bg-green-500 bg-opacity-20 py-1 px-2 text-sm font-semibold">
                      Picked Up
                    </div>
                  </div>
                  <p className="text-text_primary opacity-60 font-poppins text-base font-semibold">
                    X: {depotCoord[0]} Y: {depotCoord[1]}
                  </p>
                </div>
              </div>
              {data.map((order, index) => {
                // const orderIndex = orderList.findIndex(
                //   (orderA) => orderA.id === order.id
                // )

                // orderIndexList.push(orderIndex)

                // const distance =
                //   index === 0
                //     ? distanceMatrix[0][orderIndex + 1]
                //     : distanceMatrix[orderIndexList[index - 1] + 1][
                //         orderIndexList[index] + 1
                //       ]
                const distance = distanceList[index]

                let showButton = false
                if (index === 0 && order.delivered === false) {
                  showButton = true
                } else if (
                  index > 0 &&
                  order.delivered === false &&
                  data[index - 1].delivered === true
                ) {
                  showButton = true
                }

                return (
                  <div
                    key={order.id}
                    className="w-full flex flex-row items-stretch mb-4 "
                  >
                    <div className="flex flex-row mr-4 pt-2 w-[80px] justify-between relative">
                      <p className="text-text_primary text-xs opacity-60 font-semibold w-full">
                        <span className="block">{order.arrivalTime}</span>
                        <span className="block mt-1 whitespace-normal">
                          ({distance.toFixed(2)} km)
                        </span>
                      </p>
                      <div
                        className={`w-4 h-4 bg-highlight rounded-full flex justify-center `}
                      >
                        <div
                          className={`absolute w-1 h-[calc(100%+20px)] bg-highlight z-10 ${
                            order.delivered === false && 'bg-opacity-40'
                          } ${index === data.length - 1 && 'hidden'}`}
                        ></div>
                      </div>
                    </div>

                    <div className="w-full bg-bg_card rounded-lg shadow-lg p-4 relative">
                      <div className="w-full flex flex-row justify-between items-center font-poppins">
                        <h5 className="text-text_primary font-semibold text-lg">
                          Order #{order.id}
                        </h5>

                        <div
                          className={`${
                            order.delivered === true
                              ? 'text-green-500 bg-green-500 '
                              : 'text-yellow-500 bg-yellow-500'
                          } rounded-full bg-opacity-20 py-1 px-2 text-sm font-semibold`}
                        >
                          {order.delivered === true
                            ? 'Delivered'
                            : data[index - 1].delivered === true
                            ? 'In Transit'
                            : 'Pending'}
                        </div>
                      </div>
                      <p className="text-text_primary opacity-60 font-poppins text-base font-semibold">
                        X: {order.coord[0].toFixed(2)} Y:{' '}
                        {order.coord[1].toFixed(2)}
                      </p>
                      <p className="text-text_primary opacity-60 font-poppins text-base font-semibold">
                        {order.address}
                      </p>
                      <div className="flex flex-row mt-1 text-text_primary text-[15px] font-poppins">
                        <div className="flex-1">
                          <p>
                            <FontAwesomeIcon icon={faUser} className="mr-2" />
                            {order.customer_name}
                          </p>
                          <p>
                            <FontAwesomeIcon icon={faPhone} className="mr-2" />
                            +62 812 7113 9285
                          </p>
                        </div>
                        <div className="flex-1">
                          <ul className="list-decimal">
                            {order.item_list.map((item) => (
                              <li>{item.name}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      {showButton && (
                        <button
                          className="absolute right-6 bottom-4 bg-green-200 h-6 w-6 flex items-center justify-center rounded-md"
                          onClick={() => handleClickArrive(index)}
                        >
                          <FontAwesomeIcon icon={faCheck} />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}

              {/* <div className="w-full flex flex-row items-stretch mb-4">
                <div className="flex flex-row mr-4 pt-2 w-[80px] justify-between relative">
                  <p className="text-text_primary text-xs opacity-60 font-semibold">
                    <span className="block">
                      {data[data.length - 1].arrivalTime}
                    </span>
                    <span className="block mt-1 whitespace-nowrap">
                      (12 km)
                    </span>
                  </p>
                  <div className="w-4 h-4 bg-highlight rounded-full flex justify-center"></div>
                </div>
                <div className="w-full bg-bg_card rounded-lg shadow-lg p-4">
                  <div className="w-full flex flex-row justify-between items-center font-poppins">
                    <h5 className="text-text_primary font-semibold text-lg">
                      Depot
                    </h5>
                    <div className="rounded-full text-yellow-500 bg-yellow-500 bg-opacity-20 py-1 px-2 text-sm font-semibold">
                      {orderIndex === shipment.orders.length
                        ? 'In Transit'
                        : 'Pending'}
                    </div>
                  </div>
                  <p className="text-text_primary opacity-60 font-poppins text-base font-semibold">
                    {shipment.warehouseEnd}
                  </p>
                </div>
              </div> */}
            </div>
          </>
        )}
      </div>
      <div className="w-[60%] bg-bg_card min-h-full border-2 border-gray-200 flex items-center justify-center">
        {!noRoute && (
          <>
            <MapPlaceholder origin={origin} destination={destination} />
          </>
        )}
        {noRoute && (
          <>
            <div>No Route</div>
          </>
        )}
      </div>
    </div>
  )
}

export default Dashboard
