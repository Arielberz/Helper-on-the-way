
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'

import Login from './pages/login/Login'
import Register from './pages/register/register'
import Landing from './pages/landing/landing'
import Home from './pages/home/home'

function App() {
  

  return (
    <>
    <BrowserRouter>
        
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App;
