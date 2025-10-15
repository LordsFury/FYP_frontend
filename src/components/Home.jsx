import { useEffect, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faHistory,
  faShieldAlt,
  faBell,
  faDatabase,
} from "@fortawesome/free-solid-svg-icons";
import { AlertTriangle, History as HistoryIcon, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import useAuth from "../hooks/UseAuth";

const Home = ({ runCheck, loadingRun }) => {
  useAuth();

  const [overview, setOverview] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);

  const cards = [
    {
      icon: faShieldAlt,
      color: "text-blue-600 dark:text-blue-500",
      title: "Dashboard",
      highlight: "scan results",
      highlightColor: "text-indigo-600 dark:text-indigo-400",
      desc: "Monitor real-time scan results and keep track of system changes instantly.",
    },
    {
      icon: faBell,
      color: "text-red-500",
      title: "Alerts",
      highlight: "critical warnings",
      highlightColor: "text-red-600 dark:text-red-400",
      desc: "Stay on top of critical warnings and suspicious modifications with timely notifications.",
    },
    {
      icon: faDatabase,
      color: "text-green-600 dark:text-green-400",
      title: "History",
      highlight: "past scans",
      highlightColor: "text-green-600 dark:text-green-400",
      desc: "Review past scans and analyze trends to ensure long-term integrity.",
    },
  ];

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(
          `${import.meta.env.VITE_API_HOST}/api/system-overview/`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
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
        setOverview(data);
      } catch (error) {
        console.error(error);
      }
    };
    const fetchRecentActivity = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(
          `${import.meta.env.VITE_API_HOST}/api/recent-activity/`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
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
        setRecentActivity(data.activity);
      } catch (error) {
        console.error(error);
      }
    };
    fetchOverview();
    fetchRecentActivity();
  }, []);

  return (
    <div className="bg-gradient-to-br from-gray-100 via-white to-gray-200 dark:from-gray-950 dark:via-black dark:to-gray-900 min-h-screen text-black dark:text-white">
      <section className="text-center pt-24 py-16 px-6">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-5xl font-bold mb-6"
        >
          AIDE File Monitoring
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-lg text-gray-800 dark:text-gray-200 max-w-2xl mx-auto"
        >
          Keep track of file integrity, detect suspicious changes, and safeguard
          your system with ease.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 flex justify-center gap-4"
        >
          <button
            onClick={runCheck}
            className="cursor-pointer inline-flex items-center rounded-xl font-medium bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {loadingRun ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Running
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faPlay} className="mr-2" /> Run Check
              </>
            )}
          </button>
          <Link
            to="/history"
            className="inline-flex items-center rounded-xl font-medium border border-gray-300 dark:border-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800 px-6 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
          >
            <FontAwesomeIcon icon={faHistory} className="mr-2" /> View History
          </Link>
        </motion.div>
      </section>
      <motion.section
        className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6 max-w-6xl mx-auto mb-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={{
          hidden: { opacity: 0, y: 50 },
          visible: {
            opacity: 1,
            y: 0,
            transition: {
              staggerChildren: 0.15,
              duration: 0.6,
              ease: "easeOut",
            },
          },
        }}
      >
        {cards.map((card, i) => (
          <motion.div
            key={i}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-md hover:shadow-lg transition p-6 cursor-default"
            whileHover={{ scale: 1.03, y: -5 }}
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <FontAwesomeIcon
                icon={card.icon}
                className={`${card.color}`}
                size="xl"
              />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {card.title}
              </h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              {card.desc.split(card.highlight)[0]}
              <span className={`font-medium ${card.highlightColor}`}>
                {card.highlight}
              </span>
              {card.desc.split(card.highlight)[1]}
            </p>
          </motion.div>
        ))}
      </motion.section>
      <section className="bg-slate-100 dark:bg-slate-950 py-14 px-6">
        <h2 className="text-3xl font-bold text-center mb-12 text-slate-900 dark:text-slate-100">
          System Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {overview ? (
            <>
              {[
                {
                  title: "Last Scan",
                  value: overview.last_scan,
                  color: "text-indigo-500",
                },
                {
                  title: "Active Alerts",
                  value: overview.active_alerts,
                  color:
                    overview.active_alerts > 0
                      ? "text-red-500"
                      : "text-green-500",
                  subtitle:
                    overview.active_alerts > 0
                      ? "Issues Found"
                      : "System Healthy",
                },
                {
                  title: "Monitored Directories",
                  value: overview.monitored_files,
                  color: "text-emerald-500",
                  subtitle: "Files and directories monitored",
                },
              ].map((card, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-8 text-center"
                >
                  <h3 className="text-lg font-semibold mb-2 text-slate-800 dark:text-slate-100">
                    {card.title}
                  </h3>
                  <p
                    className={`${card.title === "Last Scan" ? "text-2xl" : "text-4xl"
                      } font-extrabold ${card.color}`}
                  >
                    {card.value}
                  </p>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">
                    {card.subtitle}
                  </p>
                </motion.div>
              ))}
            </>
          ) : (
            <p className="text-center text-slate-500">Loading overview...</p>
          )}
        </div>
      </section>
      <section className="py-14 px-6 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-slate-900 dark:text-slate-100 text-center">
          Recent Activity
        </h2>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
          }}
          className="space-y-4"
        >
          {recentActivity.length > 0 ? (
            recentActivity.map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.02 }}
                className={`flex items-center justify-between rounded-xl p-5 border shadow-sm hover:shadow-md transition-all duration-300
            ${item.level === "critical"
                    ? "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
                    : item.level === "warning"
                      ? "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800"
                      : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  }`}
              >
                <div className="flex items-center space-x-3">
                  {item.type === "alert" ? (
                    <AlertTriangle
                      className={`w-6 h-6 ${item.level === "critical"
                        ? "text-red-600"
                        : "text-yellow-500"
                        }`}
                    />
                  ) : (
                    <HistoryIcon className="w-6 h-6 text-indigo-500" />
                  )}
                  <span className="text-slate-800 dark:text-slate-200 font-medium">
                    {item.message}
                  </span>
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  {new Date(item.time).toLocaleString("en-GB", {
                    hour12: false,
                  })}
                </span>
              </motion.div>
            ))
          ) : (
            <p className="text-center text-slate-500 dark:text-slate-400">
              No recent activity yet.
            </p>
          )}
        </motion.div>
      </section>
    </div>
  );
};

export default Home;
