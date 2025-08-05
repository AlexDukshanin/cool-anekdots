import React from "react";

const AvatarUploader = ({ avatarPreview, handleFileChange }) => (
  <div className="register-input-container">
    <label className="avatar-label">Аватар:</label>
    <img
      src={
        avatarPreview ||
        "https://multi-admin.ru/mediabank_blog/11/271167/02149ef7a621fee28d753aa0d25cade0screenshot-12.png"
      }
      alt="Аватар"
      className="avatar-preview"
    />
    <label htmlFor="avatar-upload" id="upload-button" className="register-button">
      Выбрать изображение
    </label>
    <input
      id="avatar-upload"
      className="file-input-hidden"
      type="file"
      name="avatar"
      accept="image/*"
      onChange={handleFileChange}
    />
  </div>
);

export default AvatarUploader;
