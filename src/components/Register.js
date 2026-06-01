import React, { useState } from "react";
import { registerUser } from "../services/supaBaseAuthService";
import "./Register.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const Register = () => {
  const [username, setUsername] = useState(""); // Add state for username
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!username || !email || !password) {
      // Include username in validation
      setMessage("Please fill in all fields.");
      setLoading(false);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setMessage("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setMessage("Password should be at least 6 characters long.");
      setLoading(false);
      return;
    }

    try {
      const user = await registerUser(username, email, password); // Pass username
      if (user) {
        setMessage(
          "Registration pending! Please check your email to confirm your address and finalize your registration."
        );
      } else {
        setMessage(
          "Registration failed. Please check the console for more details."
        );
      }
    } catch (error) {
      console.error("Unexpected error during registration:", error);
      setMessage("Registration failed. Please try again later.");
    }

    setLoading(false);
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <div className="form-container">
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Username" // Add input field for username
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="password-container">
          <input
            type={passwordVisible ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span onClick={togglePasswordVisibility} className="password-toggle">
            <FontAwesomeIcon icon={passwordVisible ? faEyeSlash : faEye} />
          </span>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
      {message && <p className="form-message">{message}</p>}
    </div>
  );
};

export default Register;
