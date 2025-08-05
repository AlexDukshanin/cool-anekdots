import '../css/ProfilePage.css'
import React, { useEffect, useState } from 'react';
import useAuthFetch from '../hooks/token';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState(null);
    const authFetch = useAuthFetch();
    const [isEditing, setIsEditing] = useState(false);
    const [editedProfile, setEditedProfile] = useState(null);
    const { isAuth } = useAuth();
    const navigate = useNavigate();
    
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
            setError('Не удалось получить профиль');
        }
        } catch (err) {
        setError('Ошибка сети');
        }
    };

    fetchProfile();
    }, []);

    const handleEditClick = () => {
        setEditedProfile(profile);
        setIsEditing(true)
    } 

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedProfile(prev => ({ ...prev, [name]: value }));
    };

    return (
            <main>
                {profile ? (
                <div className="profile">
                    <h3>Профиль пользователя</h3>
                    <div className="profile-content">
                    <div className="profile-info">
                        <p className="profile-info-field"><strong>Имя:</strong> {profile.name}</p>
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
                    <button className="profile-button">Изменить профиль</button>
                </div>
                ) : error ? (
                <p>{error}</p>
                ) : (
                <p>Загрузка...</p>
                )}
                
            </main>
        );
    };

export default ProfilePage;