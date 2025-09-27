import { useEffect, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

function Alerts() {

  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const getAlerts = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_HOST}/api/alerts/`, {
          method: "GET",
        });
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("accessToken");
          window.location.href = "/login";
          return;
        }
        const data = await response.json();
        setAlerts(data)
      } catch (error) {
        console.error(error);
      }
    }
    getAlerts();
  }, []);

  return (
    <div className="bg-gradient-to-br from-gray-100 via-white to-gray-200 dark:from-gray-950 dark:via-black dark:to-gray-900 h-screen">
      {alerts.length === 0 ? (
        <motion.div className="w-full"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}>
          <div className="pt-24 flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg"
                fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                stroke="currentColor" className="h-8 w-8">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="mt-4 text-lg font-semibold text-gray-800 dark:text-gray-200">
              No Alerts found
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Start an action and your alerts will appear here.
            </p>
          </div>
        </motion.div>
      ) : (
        <motion.div className="w-full">
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-black dark:text-white text-center">System Alerts</h1>
            {alerts.map((alert) => (
              <div key={alert.id} className="p-4 bg-red-50 dark:bg-red-900 rounded-xl shadow">
                <h2 className="font-semibold text-lg">{alert.host}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">{alert.timestamp}</p>
                <p className="mt-2">{alert.summary}</p>
                {alert.pdf_url && (
                  <a
                    href={alert.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 underline mt-2 block"
                  >
                    View Report (PDF)
                  </a>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default Alerts;