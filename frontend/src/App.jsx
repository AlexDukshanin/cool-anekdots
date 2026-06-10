import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RandomAnecdot from './pages/RandomAnecdot';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import Header from './components/Header';
import Footer from './components/Footer';
import ProfilePage from './pages/ProfilePage'
import AddPostPage from './pages/AddPostPage';
import MainPage from './pages/MainPage/MainPage';
import './css/RegisterPage.css'
import './css/responsive.css'



function App() {
  return(
    <>
    <Header />
    <Routes>
      <Route path='/mainPage' element={<MainPage/>}></Route>
      <Route path='/AddPost' element={<AddPostPage />}></Route>
      <Route path="/" element={<RandomAnecdot/>}></Route>
      <Route path='/login' element={<LoginPage />}></Route>
      <Route path='/register' element={<RegisterPage />}></Route>
      <Route path='/profile' element={<ProfilePage />}></Route>
    </Routes>
    <Footer />
  </>
  )
}

export default App
