import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/styles/Auth.css";
import axios from "axios";

function Register() {
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Stan do ogólnego komunikatu błędu
  const [error, setError] = useState("");
  // Stan do śledzenia, które konkretne pola mają błąd (żeby je podświetlić)
  const [fieldErrors, setFieldErrors] = useState({});

  const navigate = useNavigate();
  const [role, setRole] = useState("user");

  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5001";

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const validatePassword = (password) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({}); // Resetujemy błędy pól przed nowym sprawdzeniem

    const errors = {};
    let hasEmptyFields = false;

    // 1. Sprawdzamy czy pola są puste
    if (!name.trim()) {
      errors.name = true;
      hasEmptyFields = true;
    }
    if (!surname.trim()) {
      errors.surname = true;
      hasEmptyFields = true;
    }
    if (!username.trim()) {
      errors.username = true;
      hasEmptyFields = true;
    }
    if (!email.trim()) {
      errors.email = true;
      hasEmptyFields = true;
    }
    if (!password.trim()) {
      errors.password = true;
      hasEmptyFields = true;
    }

    // Jeśli są puste pola, ustawiamy błędy i przerywamy funkcję
    if (hasEmptyFields) {
      setFieldErrors(errors);
      setError("Please fill in all required fields.");
      return;
    }

    // 2. Walidacja formatu (dopiero gdy pola nie są puste)
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      setFieldErrors({ ...errors, email: true }); // Podświetlamy email
      return;
    }

    if (!validatePassword(password)) {
      setError(
        "Password must be at least 8 characters long and contain at least one letter and one number."
      );
      setFieldErrors({ ...errors, password: true }); // Podświetlamy hasło
      return;
    }

    try {
      await axios.post(`${apiUrl}/api/auth/register`, {
        name,
        surname,
        username,
        email,
        password,
        role,
      });

      alert("Registration successful! Please log in.");
      navigate("/login");
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setError(
          error.response.data.message || "Registration error: bad request."
        );
      } else {
        setError("An unexpected error occurred. Please try again later.");
      }
      console.error(error);
    }
  };

  // Funkcja pomocnicza do stylów inputów (czerwona ramka przy błędzie)
  const getInputStyle = (fieldName) => {
    return fieldErrors[fieldName]
      ? { borderColor: "red", borderWidth: "2px" }
      : {};
  };

  return (
    <div className="form-container">
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <input
          className="form-input"
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            // Opcjonalnie: usuń błąd, gdy użytkownik zacznie pisać
            if (fieldErrors.name)
              setFieldErrors({ ...fieldErrors, name: false });
          }}
          style={getInputStyle("name")}
          // Usuwamy 'required' z HTML, aby nasza walidacja JS przejęła kontrolę i pokazała style
        />
        <input
          className="form-input"
          type="text"
          placeholder="Surname"
          value={surname}
          onChange={(e) => {
            setSurname(e.target.value);
            if (fieldErrors.surname)
              setFieldErrors({ ...fieldErrors, surname: false });
          }}
          style={getInputStyle("surname")}
        />
        <input
          className="form-input"
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            if (fieldErrors.username)
              setFieldErrors({ ...fieldErrors, username: false });
          }}
          style={getInputStyle("username")}
        />
        <input
          className="form-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (fieldErrors.email)
              setFieldErrors({ ...fieldErrors, email: false });
          }}
          style={getInputStyle("email")}
        />
        <input
          className="form-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (fieldErrors.password)
              setFieldErrors({ ...fieldErrors, password: false });
          }}
          style={getInputStyle("password")}
        />

        <div className="form-group" style={{ margin: "15px 0" }}>
          <label
            style={{
              display: "block",
              marginBottom: "5px",
              color: "#555",
              textAlign: "left",
            }}
          >
            Account Type:
          </label>
          <select
            className="form-input"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{ backgroundColor: "white", cursor: "pointer" }}
          >
            <option value="user">Tourist (Regular User)</option>
            <option value="agency">Travel Agency (Business)</option>
            <option value="caragency">Car Rental Service</option>
          </select>
        </div>

        {error && (
          <p style={{ color: "red", marginTop: "10px", fontWeight: "bold" }}>
            {error}
          </p>
        )}
        <div className="button-wrapper">
          <button className="form-button" type="submit">
            Register
          </button>
        </div>
      </form>
      <div className="form-footer">
        <p>
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
}

export default Register;
