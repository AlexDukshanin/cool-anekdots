import React from "react";
import '../css/Footer.css'

function Footer() {
    return(
        <footer>
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