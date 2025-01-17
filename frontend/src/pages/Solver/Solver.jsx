import React, { useState, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGear, faTimes } from '@fortawesome/free-solid-svg-icons'
import axios from 'axios'

const Vehicle = () => {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [file, setFile] = useState(null)
  const fileInputRef = useRef(null)

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      setUploadProgress(0)
      handleUpload(selectedFile)
    }
  }

  const handleUpload = (selectedFile) => {
    setUploading(true)
    setUploadProgress(0)

    const totalSize = selectedFile.size
    let uploadedSize = 0

    const interval = setInterval(() => {
      if (uploadedSize < totalSize) {
        uploadedSize += totalSize / 10
        setUploadProgress(Math.min((uploadedSize / totalSize) * 100, 100))
      } else {
        clearInterval(interval)
      }
    }, 300)

    setTimeout(() => {
      clearInterval(interval)
      setUploadProgress(100)
    }, 3000)
  }

  const handleSolve = () => {
    const formData = new FormData()
    formData.append('file', file)

    axios
      .post('http://localhost:5000/solve', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((response) => {
        let dirPath = response.data.dirPath
        localStorage.setItem('dirPath', dirPath)
        let problem = response.data.problem
        localStorage.setItem('problem', JSON.stringify(problem))

        let result = response.data.result

        let arrivalTimeList = result.arrival_time_list

        const startTime = '09:00'

        arrivalTimeList = arrivalTimeList.map((arrivalTime) => {
          return arrivalTime.map((deliveryTime) => {
            const [hours, minutes] = startTime.split(':').map(Number)
            const totalMinutes = hours * 60 + minutes + Math.floor(deliveryTime)

            const newHours = Math.floor(totalMinutes / 60)
            const newMinutes = totalMinutes % 60

            return `${String(newHours).padStart(2, '0')}:${String(
              newMinutes
            ).padStart(2, '0')}`
          })
        })

        localStorage.setItem('arrivalTimeList', JSON.stringify(arrivalTimeList))

        let tourList = result.tour_list

        tourList = tourList.map((data, index) => {
          const arrivalTime = arrivalTimeList[index]

          return data.map((orderIndex, index) => {
            let orderDetail = problem.order_list[orderIndex]
            orderDetail.item_list = orderDetail.item_list.map((itemId) => {
              const itemDetail = problem.product_type.find(
                (product) => product.id === itemId
              )
              return { ...itemDetail }
            })
            return {
              id: orderDetail,
              arrivalTime: arrivalTime[index],
              ...orderDetail,
              delivered: false,
            }
          })
        })

        localStorage.setItem('mappedData', JSON.stringify(tourList))
        localStorage.setItem('result', JSON.stringify(result))
        alert('Problem solved successfully')
      })
      .catch((error) => {
        console.error('Error uploading file:', error)
      })
  }

  const handleCancel = () => {
    setUploading(false)
    setUploadProgress(0)
    setFile(null)
  }

  const handleClickGenerateProblem = async () => {
    try {
      const response = await axios.post(
        'http://localhost:5000/generate-problem'
      )

      localStorage.setItem('problem', JSON.stringify(response.data.problem))
      alert('Problem generated successfully, check your download folder.')
    } catch (error) {
      console.error('Error generating problem:', error)
    }
  }

  return (
    <div className="py-10 px-10">
      <h4 className="text-3xl font-bold text-text_primary mb-5">Solver</h4>
      <div className="p-4">
        <p className="text-gray-800 text-lg">Don't have a problem yet?</p>
        <button
          onClick={handleClickGenerateProblem}
          className="bg-blue-500 text-white py-2 px-4 text-lg rounded-md mr-2 hover:bg-blue-600"
        >
          Click here to generate problem
        </button>
      </div>

      <div className="border-dashed border-2 hover:border-[#3e4756] transition duration-200 rounded-lg text-lg font-roboto flex items-center gap-4 w-[420px] h-[160px] bg-white justify-center">
        {!uploading ? (
          <div className="flex flex-col items-center w-full h-full">
            <input
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
              ref={fileInputRef}
            />
            <button
              className="w-full h-full text-[#4f6180]"
              onClick={() => fileInputRef.current.click()}
            >
              Upload <span className="text-text_primary font-[500]">JSON</span>{' '}
              problem instance to solve it
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            {uploadProgress < 100 && (
              <div className="w-full bg-gray-300 rounded-full h-4 mt-2">
                <div
                  className="bg-red-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
            {uploadProgress === 100 && (
              <div className="text-text_primary font-medium mt-2">
                Upload Successfully!
              </div>
            )}
            <div className="flex space-x-4 mt-2">
              <button
                onClick={handleSolve}
                className={`rounded-lg py-2 text-lg font-roboto flex justify-center items-center px-6 gap-4 transition duration-200 ${
                  uploadProgress === 100
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-400 text-gray-700 cursor-not-allowed'
                }`}
                disabled={uploadProgress < 100}
              >
                <FontAwesomeIcon icon={faGear} />
                Solve
              </button>
              <button
                onClick={handleCancel}
                className={`rounded-lg py-2 text-lg font-roboto flex justify-center items-center px-6 gap-4 transition duration-200 ${
                  uploadProgress === 100
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-gray-400 text-gray-700 cursor-not-allowed'
                }`}
                disabled={uploadProgress < 100}
              >
                <FontAwesomeIcon icon={faTimes} />
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Vehicle
