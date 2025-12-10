import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Message from "../global/alert";
import "../../style/user_auth/ForgotPassword.css";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Enter mobile, 2: OTP, 3: Reset Password
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]); // 6-digit OTP
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(null); // Track password match

  useEffect(() => {
    setPasswordMatch(newPassword === confirmPassword && newPassword.length > 0);
  }, [newPassword, confirmPassword]);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  // Step 1: Send OTP to Mobile
  const sendOtp = async () => {
    try {
      const response = await axios.post("https://aero31.vercel.app/api/send-otp", {
        mobileNumber,
      });

      if (response) {
        showMessage("success", "OTP sent successfully.");
        setStep(2); // Move to OTP verification
      } else {
        showMessage("error", response.data.message || "Failed to send OTP");
      }
    } catch (error) {
      showMessage("error", error.response?.data?.message || "Error sending OTP");
    }
  };

  // Step 2: Verify OTP
  const verifyOtp = async () => {
    try {
      const response = await axios.post("https://aero31.vercel.app/api/forget-password/verify-otp", {
        mobileNumber,
        otp: otp.join(""),
      });

      if (response) {
        showMessage("success", "OTP verified successfully.");
        setStep(3); // Move to reset password
      } else {
        showMessage("error", response.data.message || "Invalid OTP");
      }
    } catch (error) {
      showMessage("error", error.response?.data?.message || "Error verifying OTP");
    }
  };

  // Step 3: Reset Password
  const resetPassword = async () => {
    if (!passwordMatch) {
      showMessage("error", "Passwords do not match!");
      return;
    }

    try {
      const response = await axios.post("https://aero31.vercel.app/api/reset-password", {
        mobileNumber,
        newPassword,
      });

      if (response) {
        showMessage("success", "Password reset successfully. Redirecting...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        showMessage("error", response.data.message || "Failed to reset password");
      }
    } catch (error) {
      showMessage("error", error.response?.data?.message || "Error resetting password");
    }
  };

  // Handle OTP Input
  const handleOtpChange = (value, index) => {
    if (/^\d*$/.test(value)) {
      const updatedOtp = [...otp];
      updatedOtp[index] = value;
      setOtp(updatedOtp);

      if (value && index < otp.length - 1) {
        document.getElementById(`otp-input-${index + 1}`).focus();
      }
    }
  };

  return (
    <div className="forgot-password-container">
      {step === 1 && (
        <div className="step-container">
          <h2>Forgot Password</h2>
          <input
            type="text"
            placeholder="Enter your mobile number"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            required
          />
          <button onClick={sendOtp} className="otp-button">Send OTP</button>
        </div>
      )}

      {step === 2 && (
        <div className="step-container">
          <h2>Enter OTP</h2>
          <div className="otp-inputs">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-input-${index}`}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleOtpChange(e.target.value, index)}
                className="otp-input"
              />
            ))}
          </div>
          <button onClick={verifyOtp} className="otp-button">Verify OTP</button>
        </div>
      )}

      {step === 3 && (
        <div className="step-container">
          <h2>Reset Password</h2>
          <div className="password-field">
            <input
              type={passwordVisible ? "text" : "password"}
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            {/* <button type="button" onClick={togglePasswordVisibility} className="toggle-passwordR">
              {passwordVisible ? "👁️" : "👁️‍🗨️"}
            </button> */}

          </div>
          

          {/* <div className="password-field">
            
          </div> */}
          <div className="password-check">

          <input
              type={confirmPasswordVisible ? "text" : "password"}
              
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {/* <button type="button" onClick={toggleConfirmPasswordVisibility} className="toggle-password">
              {confirmPasswordVisible ? "👁️" : "👁️‍🗨️"}
            </button> */}
            
            {passwordMatch !== null && (
              <span className={`status-icon ${passwordMatch ? "match" : "mismatch"}`}>
                {passwordMatch ? "✔ Passwords match" : "✖ Passwords do not match"}
              </span>
            )}
          </div>

          <button onClick={resetPassword} disabled={!passwordMatch} className="reset-button">Reset Password</button>
        </div>
      )}

      <Message type={message.type} text={message.text} />
    </div>
  );
};

export default ForgotPassword;
