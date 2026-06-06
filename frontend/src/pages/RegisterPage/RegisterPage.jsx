import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import RegisterForm from "./RegisterForm";
import AvatarUploader from "./AvatarUploader";
import SuccessMessage from "./SuccessMesage"
import ErrorMessage from "./ErrorMessage";
import "../../css/RegisterPage.css";

function RegisterPage() {
  const { isAuth } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    login: "",
    password: "",
    password2: "",
    avatar: null,
    avatarPreview: "",
  });

  const [error, setError] = useState(null);
  const [mode, setMode] = useState("form");

  useEffect(() => {
    if (isAuth) {
      navigate("/profile");
    }
  }, [isAuth, navigate]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "avatar") {
      const file = files[0];
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData((prev) => ({
            ...prev,
            avatar: file,
            avatarPreview: reader.result,
          }));
        };
        reader.readAsDataURL(file);
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMode("form");

    const data = new FormData();
    data.append("login", formData.login);
    data.append("password", formData.password);
    data.append("password2", formData.password2);
    if (formData.avatar) {
      data.append("avatar", formData.avatar);
    }

    try {
      const response = await fetch("/api/auth/register/", {
        method: "POST",
        body: data,
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        let errorMessage = "Ошибка сервера";

        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          const message = [];
          for (let i in errorData) {
            if (Array.isArray(errorData[i])) {
              message.push(...errorData[i]);
            } else {
              message.push(errorData[i]);
            }
          }
          errorMessage = message.join(" ");
        } else {
          errorMessage = await response.text();
        }

        throw new Error(errorMessage);
      }

      await response.json();

      const loginResponse = await axios.post("/api/auth/login/", {
        login: formData.login,
        password: formData.password,
      });

      localStorage.setItem("access", loginResponse.data.access);
      localStorage.setItem("refresh", loginResponse.data.refresh);
      window.dispatchEvent(new Event("auth-changed"));

      setMode("success");
    } catch (err) {
      console.error("Ошибка:", err);
      setError("Ошибка регистрации или входа: " + err.message);
      setMode("error");
    }
  };

  return (
    <main>
      {mode === "form" && (
        <div className="register-container">
          <div className="register-container-splited">
            <h2 className="register-title">Регистрация</h2>
            <form className="register-flex" onSubmit={handleSubmit}>
              <div className="left">
                <RegisterForm formData={formData} handleChange={handleChange} />
              </div>
              <div className="right">
                <AvatarUploader
                  avatarPreview={formData.avatarPreview}
                  handleFileChange={handleChange}
                />
              </div>
              <div className="register-button-container">
                <button className="register-button" type="submit">
                  Зарегистрироваться
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {mode === "success" && <SuccessMessage onReturn={() => navigate("/")} />}

      {mode === "error" && <ErrorMessage error={error} onRetry={() => setMode("form")} />}
    </main>
  );
}

export default RegisterPage;
