import '../css/ProfilePage.css'
import React, { useEffect, useState } from 'react';
import useAuthFetch from '../hooks/token';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from "react-router-dom";
import PasswordChange from '../components/PasswordChange';

const ProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState(null);
    const authFetch = useAuthFetch();
    const [isEditing, setIsEditing] = useState(false);
    const [editedProfile, setEditedProfile] = useState(null);
    const { isAuth } = useAuth();
    const navigate = useNavigate();
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    
    useEffect(() => {
        if (!isAuth) {
            navigate("/login")
            } 
        }, [isAuth, navigate]);

        
    useEffect(() => {
    const fetchProfile = async () => {
        try {
        const response = await authFetch('http://127.0.0.1:8000/api/auth/profile/');
        if (response && response.ok) {
            const data = await response.json();
            setProfile(data);
        } else {
            setError('Не удалось получить данные');
        }
        } catch (err) {
        setError('Ошибка сети');
        }
    };

    fetchProfile();
    }, []);

    const HandleProfileChange = () => {
        setEditedProfile(profile);
        setIsEditing(!isEditing)
    } 
    //сохранение изменений профиля
    const handleInputChange = async () => {
        try {
            const response = await authFetch('http://127.0.0.1:8000/api/auth/profile/', {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(editedProfile)
                })
                if (response.ok) {
                    const updateProfile = await response.json()
                    setProfile(updateProfile)
                    setIsEditing(false)
                    setError(null)
                } else {
                    setError("Не удалось сохранить изменения")
                }
            } catch (el){
                setError("Ошибка, связь с сервером потеряна")
            } 
        } 
        
    return (
            <main>
                {profile ? (
                    isChangingPassword? (
                        <div className="profile">
                            <h3>Смена пароля</h3>
                            <PasswordChange />
                            <button onClick={() => setIsChangingPassword(false)} className='profile-button'>Назад</button>
                        </div>
                    ) : isEditing && editedProfile? (
                        <div className='profile'>
                            <h3>Изменить профиль</h3>
                            <div className='profile-content'>
                                <div className='profile-info'>
                                    <input
                                        className='profile-info-field' 
                                        type="text" 
                                        name='name' 
                                        value={editedProfile.name}  
                                        onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })
                                        }/>
                                    <input
                                        className='profile-info-field'
                                        type="text" 
                                        name='email' 
                                        value={editedProfile.email} 
                                        onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })
                                        }/>
                                    <input
                                        className='profile-info-field' 
                                        type="text" 
                                        name='age' 
                                        value={editedProfile.age} 
                                        onChange={(e) => setEditedProfile({ ...editedProfile, age: e.target.value })
                                        }/>
                                </div>
                                <div className="profile-avatar">
                                    <picture>
                                        <source srcSet={profile.avatar} media="(min-width: 1000px)" />
                                        <img src={profile.avatar} alt="Фото профиля" />
                                    </picture>
                                    <label className="upload-button">
                                        Изменить фото
                                        <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={handleAvatarChange} 
                                        style={{ display: 'none' }}
                                        />
                                    </label>
                                </div>
                            </div>
                            <div className='profile-button-container'>
                                <button onClick={handleInputChange} className='profile-button'>Сохранить</button>
                                <button onClick={HandleProfileChange} className='profile-button'>Назад</button>
                            </div>
                                <button className="profile-button" onClick={() => setIsChangingPassword(true)}>Сменить пароль</button>
                        </div>
                        ) : (
                        <div className="profile">
                            <h3>Профиль пользователя</h3>
                            <div className="profile-content">
                                <div className="profile-info">
                                    <p className="profile-info-field"><strong>Имя:</strong> {profile.name} </p>
                                    <p className="profile-info-field"><strong>Email:</strong> {profile.email}</p>
                                    <p className="profile-info-field"><strong>Возраст:</strong> {profile.age}</p>
                                </div>
                                <div className="profile-avatar">
                                    <picture>
                                    <source srcSet={profile.avatar} media="(min-width: 1000px)" />
                                    <img src={profile.avatar} alt="Фото профиля" />
                                    </picture>
                                </div>
                            </div>
                            <button onClick={HandleProfileChange} className="profile-button">Изменить профиль</button>
                        </div>
                            
                        )    
                ) : error ? (
                <p>{error}</p>
                ) : (
                <p>Загрузка...</p>
                )}
                
            </main>
        );
    };

export default ProfilePage;