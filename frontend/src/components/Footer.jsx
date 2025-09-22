import React, { useEffect, useState } from "react";
import '../css/Footer.css'

function Footer() {
    const [isVisible, setIsVisible] = useState(false)
    
    useEffect(() => {
        const handleScrool = () => {
            const scrollPosition = window.scrollY + window.innerHeight
            const documentHeight = document.documentElement.scrollHeight

            if (documentHeight - scrollPosition <= 100) {
                setIsVisible(true)
            } else {
                setIsVisible(false)
            }
        }
        window.addEventListener("scroll", handleScrool)

        return() => {
            window.removeEventListener("scroll", handleScrool)
        }
    })

    return(
        <footer className={isVisible ? `footer visible` : `footer`}>
            <div>
                <h1>Авторы:</h1>
                <p>Рыжий анекдотчик</p>
            </div>
            <div className="links footer-links">
                <h1>Наши конакты:</h1>
                <a className="link footer-link" href="">Вконтакте</a>
                <a className="link footer-link" href="">Почта</a>
                <a className="link footer-link" href="">Telegramm</a>
            </div>
        </footer>
    )
}

export default Footer