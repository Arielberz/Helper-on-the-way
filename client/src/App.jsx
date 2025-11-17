
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Header from './components/Header_in/Header'
import Home from './pages/home/home'
import Login from './pages/login/Login'
import Register from './pages/register/register'
import Chat from './pages/caht/chat'
import Payment from './pages/Payment/Payment'
import Rating from './pages/Rating/Rating'


function App() {
  

  return (
    <>
    <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/rating" element={<Rating />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App;
