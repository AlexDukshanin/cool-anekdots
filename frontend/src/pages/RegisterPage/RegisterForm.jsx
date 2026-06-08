import React from "react";

const RegisterForm = ({ formData, handleChange }) => (
  <>
    <div className="register-input-container">
      <label>Никнейм:</label>
      <input
        type="text"
        name="login"
        value={formData.login}
        onChange={handleChange}
        className="register-input-field"
        placeholder="Например: alex"
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
