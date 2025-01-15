import React from 'react'
import RenderPlotly from './components/RenderPlotly'
import styles from '../../styles/style'
import { cardboard } from '../../constants/pack'
import { useParams } from 'react-router-dom'
const Cardboard = () => {
  let { vehicleId, cardboardId } = useParams()
  let skip = false
  if (cardboardId === 'undefined') {
    skip = true
  }
  let packingInfo
  if (!skip) {
    vehicleId = Number(vehicleId)
    cardboardId = Number(cardboardId)

    let vehicleList = JSON.parse(localStorage.getItem('problem')).vehicle_list
    let indexOfVehicle = vehicleList.findIndex(
      (detail) => detail.id === vehicleId
    )

    packingInfo = JSON.parse(localStorage.getItem('result'))
      .packing_information[indexOfVehicle]

    let indexOfCardboard = packingInfo.findIndex(
      (detail) => detail.id === cardboardId
    )
    packingInfo = packingInfo[indexOfCardboard]

    packingInfo = {
      ID: packingInfo.id,
      Type: 'CardboardContainer',
      SizeX: packingInfo.size[0],
      SizeY: packingInfo.size[1],
      SizeZ: packingInfo.size[2],
      ItemList: packingInfo.packed_items.map((packedItem) => {
        return {
          id: packedItem.id,
          PosX: packedItem.pos[0],
          PosY: packedItem.pos[1],
          PosZ: packedItem.pos[2],
          SizeX: packedItem.size[0],
          SizeY: packedItem.size[1],
          SizeZ: packedItem.size[2],
          type: packedItem.type,
        }
      }),
    }
  }

  return (
    <div className="py-[10px] px-10 h-full relative">
      <h4 className={`${styles.heading4} mt-7 text-text_primary mb-5`}>
        Cardboard
      </h4>
      <div className="flex flex-row justify-around mt-8">
        {!skip && (
          <>
            <div className="mr-4">
              <RenderPlotly container={packingInfo} />
            </div>
            <div className="w-[360px] ml-4 flex flex-col border-2 border-[#6F6F70] rounded-lg mt-4 bg-white p-[20px] max-h-[800px] overflow-y-scroll">
              {packingInfo.ItemList.map((item) => (
                <div
                  key={item.id}
                  className="border-2 border-[#6F6F70] rounded-md w-full p-4 mb-4"
                >
                  <h3>Item ID: {item.id}</h3>
                  <div>
                    Pos X: {item.PosX} Pos Y: {item.PosY} Pos Z: {item.PosZ}
                  </div>
                  <div>
                    Size X: {item.SizeX} Size Y: {item.SizeY} Size Z:{' '}
                    {item.SizeZ}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        {skip && (
          <>
            <div className="absolute inset-0 flex items-center justify-center text-[24px] font-semibold text-opacity-30">
              No Packing
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Cardboard
