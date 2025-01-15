import React from 'react'
import RenderPlotly2 from './components/RenderPlotly2'
import styles from '../../styles/style'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDownload } from '@fortawesome/free-solid-svg-icons'
import { useParams } from 'react-router-dom'
import axios from 'axios'
const Vehicle = () => {
  let { vehicleId } = useParams()
  vehicleId = Number(vehicleId)

  const vehicleList = JSON.parse(localStorage.getItem('problem')).vehicle_list
  const indexOfVehicle = vehicleList.findIndex(
    (vehicleDetail) => vehicleDetail.id === vehicleId
  )

  let vehicleExist = indexOfVehicle === -1 ? false : true
  let container = {}

  if (vehicleExist) {
    const vehicleInformation = vehicleList[indexOfVehicle]

    const packingInformation =
      JSON.parse(localStorage.getItem('result')).packing_information[
        indexOfVehicle
      ] || {}

    container = {
      ...vehicleInformation,
      ItemList: packingInformation,
    }

    container.ItemList = container.ItemList.map((item) => {
      const mappedData = {
        type: item.type,
        id: item.id,
        SizeX: item.size[0],
        SizeY: item.size[1],
        SizeZ: item.size[2],
        PosX: item.pos[0],
        PosY: item.pos[1],
        PosZ: item.pos[2],
      }

      return mappedData
    })
  }

  const filePath = `file:///${localStorage.getItem(
    'dirPath'
  )}\\Loading-Plan-${indexOfVehicle}.pdf`

  const handleOpenGuidebook = () => {
    console.log(indexOfVehicle)
    axios
      .post(
        'http://localhost:5000/read-pdf',
        { indexOfVehicle },
        {
          responseType: 'blob',
        }
      ) // Set responseType to 'blob' to handle binary data
      .then((response) => {
        const file = new Blob([response.data], { type: 'application/pdf' })
        const fileURL = URL.createObjectURL(file)

        // Create a temporary link to trigger the download
        const link = document.createElement('a')
        link.href = fileURL
        link.download = 'guidebook.pdf' // Set the desired file name
        link.click() // Trigger the download
        URL.revokeObjectURL(fileURL) // Clean up the object URL
      })
      .catch((error) => {
        console.error('Error fetching the PDF:', error)
      })
  }

  return (
    <div className="py-[10px] px-10">
      <h4 className={`${styles.heading4} mt-7 text-text_primary mb-5`}>
        Vehicle
      </h4>
      {vehicleExist && (
        <>
          <div className="flex flex-row justify-around mt-8">
            <div className="mr-4">
              <RenderPlotly2 container={container} />
            </div>
            <div className="pl-4">
              <button
                className="w-full bg-red-500 rounded-lg h-[64px] text-2xl font-roboto text-white flex justify-start items-center px-6 gap-8"
                onClick={handleOpenGuidebook}
              >
                <FontAwesomeIcon icon={faDownload} />
                Download Guidebook
              </button>

              <div className="w-[360px] flex flex-col border-2 border-[#6F6F70] rounded-lg mt-4 h-full max-h-[720px] bg-white p-[20px] overflow-y-scroll">
                {container.ItemList.map((item) => (
                  <div
                    key={item.id}
                    className="border-2 border-[#6F6F70] rounded-md w-full p-4 mb-4"
                  >
                    <h3>
                      {item.type} ID: {item.id}
                    </h3>
                    <div>
                      Pos X: {item.PosX} Pos Y: {item.PosY} Pos Z: {item.PosZ}
                    </div>
                    <div>
                      Size X: {item.SizeX} Size Y: {item.SizeY} Size Z:{' '}
                      {item.SizeZ}
                    </div>
                  </div>
                ))}
                {container.ItemList.length === 0 && (
                  <>
                    <p>No Packing Scheduled</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Vehicle
