import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../App.css";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "../App.css";
import {
  faChartBar,
  faCog,
  faBell,
  faHistory,
  faBars,
  faTimes
} from "@fortawesome/free-solid-svg-icons";
import { faMoon, faSun, faShieldAlt, faCheckCircle, faPlay, faSignInAlt, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { Loader2 } from "lucide-react";

const Navbar = ({ loadingRun, runCheck, unreadCount, setUnreadCount, openAlerts }) => {

  const [loadingChanges, setLoadingChanges] = useState(false);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState("light");
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setTheme("dark");
    }
    const handleStorageChange = () => setAccessToken(localStorage.getItem("accessToken"));
    window.addEventListener("storage", handleStorageChange);
    handleStorageChange();
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const toggleTheme = () => {
    if (theme === "dark") {
      localStorage.setItem("theme", "light");
      document.documentElement.classList.remove("dark");
      setTheme("light")
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setTheme("dark");
    }
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: faChartBar },
    { name: "Settings", path: "/settings", icon: faCog },
    { name: "Alerts", path: "/alerts", icon: faBell },
    { name: "History", path: "/history", icon: faHistory },
  ];

  async function handleAcceptChanges() {
    setLoadingChanges(true);
    const token = localStorage.getItem("accessToken");
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_HOST}/api/accept-changes/`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
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
      if (data.success) {
        await runCheck();
        toast.success(data.output, { autoClose: 2000 });
        navigate("/dashboard");
      } else {
        toast.error("Error occured while accepting changes", {
          autoClose: 2000,
        });
      }
    } catch (err) {
      console.error("Error accepting changes:", err);
    }
    setLoadingChanges(false);
  }

  const handleLogout = () => {
    setAccessToken(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/login");
  }

  return (
    <nav className="fixed top-0 w-full z-50 px-6 py-3 bg-gray-200 dark:bg-gray-900">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-10">
          <Link to="/" className="text-gray-900 dark:text-white font-extrabold text-2xl tracking-wide flex items-center gap-1">
            <FontAwesomeIcon icon={faShieldAlt} className="text-blue-600 dark:text-blue-400" />
            AIDE
          </Link>
          {accessToken && (
            <div className="hidden lg:flex items-center lg:gap-4 xl:gap-10 gap-8 text-gray-700 dark:text-zinc-200 text-base">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => {
                    if (item.name === "Alerts") {
                      openAlerts();
                      setUnreadCount(0);
                    }
                  }}
                  className="relative group font-medium text-lg hover:text-blue-700 dark:hover:text-blue-400 transition-transform duration-300 hover:scale-110">
                  {item.name}
                  {item.name === "Alerts" && unreadCount > 0 && (
                    <span className="absolute -top-2 -right-3 bg-red-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                  <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-blue-600 dark:bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              ))}
            </div>
          )}
        </div>
        <div className="hidden lg:flex items-center gap-5">
          <button
            onClick={toggleTheme}
            className="py-1.5 px-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-yellow-500 dark:to-orange-500 text-white shadow-md hover:scale-110 transition">
            <FontAwesomeIcon icon={theme === "dark" ? faSun : faMoon} />
          </button>
          {accessToken && (
            <>
              <button
                onClick={handleAcceptChanges}
                disabled={loadingChanges || loadingRun}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white shadow-md transition ${loadingChanges
                  ? "bg-blue-600 cursor-wait"
                  : "bg-emerald-600 hover:bg-emerald-700"
                  }`}
              >
                {loadingChanges ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Processing
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faCheckCircle} /> Accept Changes
                  </>
                )}
              </button>
              <button
                onClick={runCheck}
                disabled={loadingRun || loadingChanges}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white shadow-md transition ${loadingRun
                  ? "bg-blue-600 cursor-wait"
                  : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
              >
                {loadingRun ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Running
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faPlay} /> Run Check
                  </>
                )}
              </button>
            </>
          )}
          {accessToken ? (
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium shadow-md transition">
              <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-medium shadow-md transition">
              <FontAwesomeIcon icon={faSignInAlt} className="mr-2" />
              Login
            </Link>
          )}
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="lg:hidden text-2xl bg-gradient-to-r from-indigo-500 to-blue-500 rounded-sm p-1 text-white focus:outline-none"
        >
          <FontAwesomeIcon icon={faBars} />
        </button>
      </div>
      <div className={`fixed lg:hidden h-full top-0 right-0 w-96 dark:bg-gray-900 bg-gray-200 shadow-xl z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex justify-between items-center py-3.5 px-6 border-b border-gray-300 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            Menu
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="py-1.5 px-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-yellow-500 dark:to-orange-500 text-white shadow-md hover:scale-110 transition"
            >
              <FontAwesomeIcon icon={theme === "dark" ? faSun : faMoon} />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="text-2xl text-gray-900 dark:text-white"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </div>
        <div className="flex flex-col p-6 gap-4 text-gray-800 dark:text-zinc-200">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => {
                setIsOpen(false);
                if (item.name === "Alerts") {
                  openAlerts();
                  setUnreadCount(0);
                }
              }}
              className="flex items-center gap-4 p-4 rounded-xl 
               bg-white/50 dark:bg-gray-800/80 
               shadow-sm hover:shadow-md 
               transition-all duration-200 
               hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="flex h-10 w-10 items-center justify-center 
                    rounded-lg bg-blue-100 dark:bg-blue-900">
                <FontAwesomeIcon
                  icon={item.icon}
                  className="text-blue-600 dark:text-blue-400 text-lg"
                />
              </div>
              <span className="text-gray-800 relative dark:text-gray-200 font-medium text-base">
                {item.name}
                {item.name === "Alerts" && unreadCount > 0 && (
                  <span className="absolute -top-2 -right-6 bg-red-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </span>
            </Link>
          ))}
          <div className="flex flex-col gap-3 mt-6">
            <button
              onClick={() => {
                handleAcceptChanges();
                setIsOpen(false);
              }}
              disabled={loadingChanges}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-white shadow-md transition ${loadingChanges
                ? "bg-blue-600 cursor-wait"
                : "bg-emerald-600 hover:bg-emerald-700"
                }`}
            >
              {loadingChanges ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Processing
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faCheckCircle} /> Accept Changes
                </>
              )}
            </button>
            <button
              onClick={() => {
                runCheck();
                setIsOpen(false);
              }}
              disabled={loadingRun}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-white shadow-md transition ${loadingRun
                ? "bg-blue-600 cursor-wait"
                : "bg-indigo-600 hover:bg-indigo-700"
                }`}
            >
              {loadingRun ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Running
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faPlay} /> Run Check
                </>
              )}
            </button>

            {accessToken ? (
              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium shadow-md transition"
              >
                <FontAwesomeIcon icon={faSignOutAlt} /> Logout
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-medium shadow-md transition"
              >
                <FontAwesomeIcon icon={faSignInAlt} /> Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>

  );
};

export default Navbar;
