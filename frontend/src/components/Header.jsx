import React, { useState } from "react";
import '../css/Header.css' 
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function Header() {
    const { isAuth } = useAuth();
    const [isOpen, setIsOpen] = useState(false)

    const openMenu = () => setIsOpen(true)
    const closeMenu = () => setIsOpen(false)

    const showMenu = () => {
        if (isOpen == false) {
            openMenu()
        } else {
            closeMenu()
        }
    }


    const handleLogout = () => {
        localStorage.removeItem('access')
        localStorage.removeItem('refresh')
        window.location.reload()
    }

    return(
        <header>
            <div>
                <h1>Сайт с анекдотами</h1>
                <p>Твои кореша заценят наши анекдоты</p>
            </div>
            <div className="links">
                <Link className="link" to='/'>Главная</Link>

                {isAuth ? (
                    <button onClick={handleLogout} className="link button-link">Выйти</button>
                ) : (
                    <Link className="link" to='/login'>Войти</Link>
                )}
                <button onClick={showMenu} className="link button-link">Меню</button>
            </div>
                <div className={`hidden-menu ${isOpen ? 'open' : ''}`}>
                    <div className="menu-links">
                        <Link onClick={showMenu} className="link menu-link" to="/">Рандомный анекдот</Link>
                        <Link onClick={showMenu} className="link menu-link" to='/profile'> Мой профиль</Link>
                        <Link onClick={showMenu} className="link menu-link">Добавить анекдот</Link>
                        <Link onClick={showMenu} className="link menu-link">Контакты </Link>
                    </div>
                </div>
        </header>
    )
}

export default Header