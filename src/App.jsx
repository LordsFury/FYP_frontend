import './App.css';
import { useNavigate } from 'react-router-dom';
import Home from './components/Home';
import { ToastContainer } from 'react-toastify';
import Dashboard from "./components/Dashboard";
import Settings from "./components/Settings";
import Alerts from "./components/Alerts";
import History from "./components/History";
import { Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import ForgetPassword from "./components/ForgetPassword";


function App() {

  const navigate = useNavigate();
  const [aideData, setAideData] = useState(null);
  const [loadingRun, setLoadingRun] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${import.meta.env.VITE_API_HOST}/api/alerts/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      });
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("accessToken");
        if (location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return;
      }
      const data = await response.json();
      const count = data.filter(alert => !alert.is_read).length;
      setUnreadCount(count);
    } catch (err) {
      console.error("Error fetching alerts:", err);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  const handleOpenAlerts = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${import.meta.env.VITE_API_HOST}/api/alerts/mark-read/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }
      );
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("accessToken");
        if (location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return;
      }
      setUnreadCount(0);
      navigate("/alerts");
    } catch (err) {
      console.error("Error marking alerts as read:", err);
    }
  };

  const handleRunCheck = async () => {
    setLoadingRun(true);
    const token = localStorage.getItem("accessToken");
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_HOST}/api/run-check/`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("accessToken");
        if (location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return;
      }
      const data = await response.json();
      setAideData(data);
      navigate("/dashboard");
    } catch (error) {
      console.log(error);
      setAideData({ status: false, output: "Error running AIDE check." });
    }
    setLoadingRun(false);
  };

  return (
    <>
      <ToastContainer />
      <Navbar runCheck={handleRunCheck} loadingRun={loadingRun} unreadCount={unreadCount} setUnreadCount={setUnreadCount} openAlerts={handleOpenAlerts} />
      <Routes>
        <Route path='/' element={<Home runCheck={handleRunCheck} loadingRun={loadingRun} />} />
        <Route path="/dashboard" element={<Dashboard aideData={aideData} />} />
        <Route path="/history" element={<History onDeleted={(scanId) => { if (scanId === null) { setAideData(null); } else if (aideData?.scan_id === scanId) { setAideData(null); } }} />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forget-password" element={<ForgetPassword />} />
      </Routes>
    </>
  );
}

export default App;
