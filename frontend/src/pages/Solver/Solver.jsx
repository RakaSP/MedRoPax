import React, { useState, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGear, faTimes } from '@fortawesome/free-solid-svg-icons'
import axios from 'axios'
import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'

const Vehicle = () => {
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState(null)
  const [args, setArgs] = useState({
    '--insertion-mode': 'first-fit',
    '--construction-mode': 'wall-building',
    '--min-cardboard-utility': 0.8,
    '--best-config-mode': false,
  })

  const fileInputRef = useRef(null)

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const handleSolve = () => {
    setLoading(true)
    const formData = new FormData()
    formData.append('file', file)
    Object.entries(args).forEach(([key, value]) => {
      formData.append(key, value.toString())
    })
    axios
      .post('http://localhost:5000/solve', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((response) => {
        localStorage.clear()
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    setArgs((prevArgs) => ({
      ...prevArgs,
      [name]:
        type === 'checkbox'
          ? checked
          : type === 'number'
          ? parseFloat(value)
          : value,
    }))
  }

  const Tooltip = ({ text }) => (
    <div className="relative group inline-block ml-1">
      <FontAwesomeIcon icon={faQuestionCircle} />
      <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 w-64 z-50">
        {text}
      </div>
    </div>
  )

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
      <div className="flex flex-row">
        <div className="border-dashed border-2 hover:border-[#3e4756] transition duration-200 rounded-lg text-lg font-roboto flex items-center gap-4 w-[420px] h-[160px] bg-white justify-center">
          {file === null ? (
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
                Upload{' '}
                <span className="text-text_primary font-[500]">JSON</span>{' '}
                problem instance to solve it
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="mt-2">
                <h5>Select Arguments</h5>
              </div>

              <div className="flex space-x-4 mt-2">
                <button
                  onClick={handleSolve}
                  className={`rounded-lg py-2 text-lg font-roboto flex justify-center items-center px-6 gap-4 transition duration-200 bg-green-600 hover:bg-green-700 text-white`}
                >
                  {loading ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin /> Solving...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faGear} />
                      Solve
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  className={`rounded-lg py-2 text-lg font-roboto flex justify-center items-center px-6 gap-4 transition duration-200 bg-red-600 hover:bg-red-700 text-white`}
                >
                  <FontAwesomeIcon icon={faTimes} />
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="w-[300px]">
          <div className="ml-8 max-w-lg">
            <h2 className="text-xl font-bold mb-4">Modify Solver Arguments</h2>
            {/* Best Config Mode (Checkbox) */}
            <div className="mt-4">
              <div className="flex justify-between items-center">
                <label>Best Config Mode</label>
                <Tooltip text="If checked, solve with all parameter combinations." />
              </div>
              <input
                type="checkbox"
                name="--best-config-mode"
                checked={args['--best-config-mode']}
                onChange={handleChange}
                className="mt-1 w-5 h-5"
              />
              {args['--best-config-mode'] && (
                <p className="mt-2 text-sm text-red-600 w-full break-words">
                  ⚠ Warning: Enabling this will significantly increase solve
                  time.
                </p>
              )}
            </div>

            {/* Insertion Mode */}
            <div className="mt-4">
              <div className="flex justify-between items-center">
                <label>Insertion Mode</label>
                <Tooltip text="How the insertion module select the insertion point given a cargo/item." />
              </div>
              <select
                name="--insertion-mode"
                value={args['--insertion-mode']}
                onChange={handleChange}
                disabled={args['--best-config-mode']}
                className="w-full border rounded px-2 py-1 mt-1"
              >
                <option value="first-fit">First-Fit</option>
                <option value="best-fit">Best-Fit</option>
              </select>
            </div>

            {/* Construction Mode */}
            <div className="mt-4">
              <div className="flex justify-between items-center">
                <label>Construction Mode</label>
                <Tooltip text="construction mode for the insertion/how to order the potential insertion point. Only necessary when insertion mode is first-fit." />
              </div>
              <select
                name="--construction-mode"
                value={args['--construction-mode']}
                onChange={handleChange}
                disabled={
                  args['--best-config-mode'] ||
                  args['--insertion-mode'] === 'best-fit'
                }
                className="w-full border rounded px-2 py-1 mt-1"
              >
                <option value="wall-building">Wall-Building</option>
                <option value="layer-building">Layer-Building</option>
                <option value="column-building">Column-Building</option>
              </select>
            </div>

            {/* Min Cardboard Utility */}
            <div className="mt-4">
              <div className="flex justify-between items-center">
                <label>Min Cardboard Utility</label>
                <Tooltip text="Minimum cardboard box utility threshold (zeta in Algorithm 1)." />
              </div>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                name="--min-cardboard-utility"
                value={args['--min-cardboard-utility']}
                onChange={handleChange}
                disabled={args['--best-config-mode']}
                className="w-full border rounded px-2 py-1 mt-1"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Vehicle
