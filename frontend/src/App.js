import './App.css'
import { Routes, Route } from 'react-router-dom'

import LoginPage from './pages/Login'
import EmployeeLayout from './common/EmployeeLayout'

import Admin from './pages/Admin'
import ShipmentList from './pages/Admin/ShipmentList'
import OrderList from './pages/Admin/OrderList'
import OrderDetail from './pages/Admin/OrderDetail'
import Vehicles from './pages/Admin/Vehicles'

import Driver from './pages/Driver'
import DriverDashboard from './pages/Driver/Dashboard'

import Packer from './pages/Packer'
import PackerVehicle from './pages/Packer/Vehicle'
import PackerCardboard from './pages/Packer/Cardboard'

import Solver from './pages/Solver'
import SolverMain from './pages/Solver/Solver'
function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LoginPage />}></Route>
        <Route path="/" element={<EmployeeLayout />}>
          <Route path="/admin" element={<Admin />}>
            <Route path="vehicles" element={<Vehicles />} />
            <Route path="shipment" element={<ShipmentList />} />
            <Route path="order" element={<OrderList />} />
            <Route path="order/:id" element={<OrderDetail />} />
          </Route>
          <Route path="/driver" element={<Driver />}>
            <Route path=":id" element={<DriverDashboard />}></Route>
          </Route>
          <Route path="packer" element={<Packer />}>
            <Route path="vehicle/:vehicleId" element={<PackerVehicle />} />
            <Route
              path="vehicle/:vehicleId/cardboard/:cardboardId"
              element={<PackerCardboard />}
            />
          </Route>
          <Route path="solver" element={<Solver />}>
            <Route path="" element={<SolverMain />}></Route>
          </Route>
        </Route>
      </Routes>
    </>
  )
}

export default App
