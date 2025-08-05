import React from "react";

const RegisterForm = ({ formData, handleChange }) => (
  <>
    <div className="register-input-container">
      <label>Имя:</label>
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        className="register-input-field"
        required
      />
    </div>
    <div className="register-input-container">
      <label>Email:</label>
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        className="register-input-field"
        required
      />
    </div>
    <div className="register-input-container">
      <label>Возраст:</label>
      <input
        type="number"
        name="age"
        value={formData.age}
        onChange={handleChange}
        className="register-input-field"
        required
      />
    </div>
    <div className="register-input-container">
      <label>Пароль:</label>
      <input
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        className="register-input-field"
        required
      />
    </div>
    <div className="register-input-container">
      <label>Повторите пароль:</label>
      <input
        type="password"
        name="password2"
        value={formData.password2}
        onChange={handleChange}
        className="register-input-field"
        required
      />
    </div>
  </>
);

export default RegisterForm;
