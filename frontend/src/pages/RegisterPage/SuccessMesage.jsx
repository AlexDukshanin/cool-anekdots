import React from "react";

const SuccessMessage = ({ onReturn }) => (
  <div className="success-container">
    <div className="success-message">
      <h2 style={{ color: "green" }}>Регистрация успешна!</h2>
      <button className="register-button" onClick={onReturn}>
        На главную
      </button>
    </div>
  </div>
);

export default SuccessMessage;
