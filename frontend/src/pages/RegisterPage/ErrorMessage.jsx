import React from "react";

const ErrorMessage = ({ error, onRetry }) => (
  <div className="error-container">
    <div className="error-message">
      <h2>Ошибка регистрации</h2>
      <p>{error}</p>
      <button className="register-button" onClick={onRetry}>
        Повторить
      </button>
    </div>
  </div>
);

export default ErrorMessage;
