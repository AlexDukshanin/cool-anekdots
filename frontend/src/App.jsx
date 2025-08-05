import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import Header from './components/Header';
import Footer from './components/Footer';
import ProfilePage from './pages/ProfilePage'
import './css/RegisterPage.css'


function App() {
  return(
    <>
    <Header />
    <Routes>
      <Route path="/" element={<MainPage />}></Route>
      <Route path='/login' element={<LoginPage />}></Route>
      <Route path='/register' element={<RegisterPage />}></Route>
      <Route path='/profile' element={<ProfilePage />}></Route>
    </Routes>
    <Footer />
  </>
  )
}

export default App
