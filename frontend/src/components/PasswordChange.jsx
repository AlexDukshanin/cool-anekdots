import React, { useState, useEffect } from "react";
import useAuthFetch from "../hooks/token";

const PasswordChange = ({ onCancel }) => {
    const AuthFetch = useAuthFetch()

    const [passwordData, setPasswordData] = useState({
        old_password: '',
        new_password: '',
        new_password2: '',
    })

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (error) {
        const timer = setTimeout(() => setError(null), 5000);
        return () => clearTimeout(timer);
        }
    }, [error]);

    useEffect(() => {
        if (success) {
        const timer = setTimeout(() => setSuccess(null), 5000);
        return () => clearTimeout(timer);
        }
    }, [success]);

    const handleChange = (e) => {
        const { name, value } = e.target
        setPasswordData(prev => ({ ...prev, [name] :value }))      
    }

    const handleSubmit = async(e) => {
        e.preventDefault()
        setError(null)
        setSuccess(null)
        setLoading(false)

        try {
            const response = await AuthFetch('http://127.0.0.1:8000/api/auth/change-password/', {
                method: 'POST',
                // headers: {'content-type': 'application/json'},
                body: JSON.stringify(passwordData)
            })
            setLoading(false)

            if (response.ok) {
                setSuccess('Пароль успешно изменен')
                setPasswordData({'old_password': '', 'new_password': '', 'new_password2':''})
            } else {
                const errorData = await response.json();
                const allErrors = [];

                Object.values(errorData).forEach(arr => {
                if (Array.isArray(arr)) allErrors.push(...arr);
                else if (typeof arr === "string") allErrors.push(arr);
                });

                setError(allErrors.join(' '));
            }
            } catch (err) {
            setLoading(false);
            setError('Ошибка соединения');
            }
        };

    return (
        <form className="profile-form-container" onSubmit={handleSubmit}>
            <h3>Сменить Пароль</h3>
            <div className="profile-info">
            <input 
                className='profile-info-field'
                type="password" 
                name="old_password" 
                placeholder="Старый пароль" 
                value={passwordData.old_password} 
                onChange={handleChange}/>
            <input
                className='profile-info-field' 
                type="password" 
                name="new_password" 
                placeholder="Новый пароль" 
                value={passwordData.new_password} 
                onChange={handleChange}/>
            <input
                className='profile-info-field' 
                type="password" 
                name="new_password2" 
                placeholder="Подтвердите пароль" 
                value={passwordData.new_password2} 
                onChange={handleChange}/>
            </div>
            {error && <p className="profile-error-message">{error}</p>}
            {success && <p className="profile-success-message">{success}</p>}
            <div className="profile-button-container">
                <button type="submit" className="profile-button" disabled={loading}>
                    {loading ? 'Сохраняем' : 'Сменить пароль'}
                </button>
                {/* Кнопка Назад вызывает onCancel */}
                <button
                    type="button"
                    onClick={onCancel}
                    className="profile-button"
                    >
                    Назад
                </button>
            </div>
        </form>
    )

}

export default PasswordChange
