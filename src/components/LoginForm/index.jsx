import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function LoginForm() {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    const apiEndpoint = "http://172.20.10.3:8080/user";

    try {
      const response = await axios.post(
        apiEndpoint,
        {
          userName: userName,
          password: password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data;

      if (data.success) {
        console.log("Logged in successfully");
        handleCancel();
      } else {
        setErrorMessage(data.message || "Login failed");
      }
    } catch (error) {
      console.error("There was a problem with the login request:", error);
      setErrorMessage("An error occurred. Please try again.");
    }
  }

  function handleCancel() {
    setUserName("");
    setPassword("");
    setErrorMessage("");
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#434343]">
      <div className="bg-[#E9E9E9] shadow-md rounded-lg w-full max-w-lg text-center">
        <h4 className="text-2xl font-semibold p-4 border-b">ĐĂNG NHẬP</h4>
        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 text-red-500">{errorMessage}</div>
          )}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="flex items-center">
                <label className="w-1/4 text-right mr-4" htmlFor="fullName">
                  Tài khoản:
                </label>
                <div className="flex-grow">
                  <input
                    type="text"
                    className="form-input w-full p-2 border border-gray-300 rounded-md"
                    id="fullName"
                    placeholder="Tài khoản"
                    onChange={(e) => setUserName(e.target.value)}
                    value={userName}
                    required
                  />
                </div>
              </div>
              <div className="flex items-center">
                <label className="w-1/4 text-right mr-4" htmlFor="password">
                  Mật khẩu:
                </label>
                <div className="flex-grow">
                  <input
                    type="password"
                    className="form-input w-full p-2 border border-gray-300 rounded-md"
                    id="password"
                    placeholder="Mật khẩu"
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    required
                  />
                </div>
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="w-1/2 bg-gray-800 text-yellow-300 py-2 px-4 rounded-md"
                >
                  ĐĂNG NHẬP
                </button>
                <button
                  type="cancel"
                  className="w-1/2 bg-white border border-gray-300 py-2 px-4 rounded-md"
                  onClick={handleCancel}
                >
                  HỦY
                </button>
              </div>
              <Link to={"/register"} className="flex space-x-4 justify-center">
                ĐĂNG KÝ NGAY
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
