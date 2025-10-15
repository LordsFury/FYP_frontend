import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../App.css";
import {
  faClock,
  faCheck,
  faWarning,
  faCross,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import useAuth from "../hooks/UseAuth";
import { toast } from "react-toastify";
import { DownloadIcon, FileCheck, FileTextIcon } from "lucide-react";
import ViewModal from "./ViewModal";
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from "recharts";

function Dashboard({ aideData }) {
  useAuth();

  const [lastScan, setLastScan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dbInfo, setDbInfo] = useState([]);
  const [scanHistory, setScanHistory] = useState([]);
  const [details, setDetails] = useState({
    addedFiles: [],
    removedFiles: [],
    changedFiles: [],
    detailedInfo: [],
    dbAttributes: {}
  });
  const [summary, setSummary] = useState({
    startTimestamp: "",
    endTimestamp: "",
    totalFiles: 0,
    filesAdded: 0,
    filesRemoved: 0,
    filesChanged: 0
  });

  const [isOpen, setIsOpen] = useState(false);

  const fetchScanHistory = async () => {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(`${import.meta.env.VITE_API_HOST}/api/all-data/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem("accessToken");
      if (location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    if (response.ok) {
      const data = await response.json();
      setScanHistory(data.allData || []);
    }
  };

  const fetchscanData = async () => {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(`${import.meta.env.VITE_API_HOST}/api/last-scan/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem("accessToken");
      if (location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    const data = await response.json();
    if (data.success) {
      setLastScan(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchscanData();
    fetchScanHistory();
  }, []);

  const scanData = aideData || lastScan;

  const pieData = [
    { name: "Changed", value: scanData?.files_changed || 0 },
    { name: "Added", value: scanData?.files_added || 0 },
    { name: "Removed", value: scanData?.files_removed || 0 },
  ];
  const COLORS = ["#f59e0b", "#10b981", "#ef4444"];

  const barData = scanHistory.map((scan, i) => {
    const date = new Date(scan.run_time);

    const formattedTime = date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    return {
      name: `Scan ${i + 1}`,
      Time: formattedTime,
      Changed: scan.files_changed,
      Added: scan.files_added,
      Removed: scan.files_removed,
    };
  });


  const getStatusIcon = () => {
    if (!scanData) return null;
    if (scanData.status === "success") return faCheck;
    if (scanData.status === "false") return faCross;
    return faWarning;
  };

  const getStatusBg = () => {
    if (!scanData) return "bg-gray-500";
    if (scanData.status === "success") return "bg-emerald-700";
    if (scanData.status === "false") return "bg-yellow-500";
    return "bg-red-500";
  };

  const handleView = async (e, scan_id) => {
    e.preventDefault();
    const token = localStorage.getItem("accessToken");
    const response = await fetch(
      `${import.meta.env.VITE_API_HOST}/api/view-report/${scan_id}`,
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
    setSummary({
      startTimestamp: data.data.summary["Start Timestamp"],
      endTimestamp: data.data.summary["End Timestamp"],
      totalFiles: data.data.summary["Total Files Scanned"],
      filesAdded: data.data.summary["Files Added"],
      filesRemoved: data.data.summary["Files Removed"],
      filesChanged: data.data.summary["Files Changed"],
    });
    setDetails({
      addedFiles: data.data.details["Added Files"] || [],
      removedFiles: data.data.details["Removed Files"] || [],
      changedFiles: data.data.details["Changed Files"] || [],
      detailedInfo: data.data.details["Detailed Info"] || [],
      dbAttributes: data.data.db_attributes || {},
    });
    setDbInfo(data.data.db_info || []);
    setIsOpen(true);
  }

  const handleDownload = async (e, scan_id) => {
    e.preventDefault();
    const token = localStorage.getItem("accessToken");
    const response = await fetch(
      `${import.meta.env.VITE_API_HOST}/api/download-report/${scan_id}`,
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
    if (!response.ok) {
      toast.error("Download failed", { autoClose: 2000 });
      return;
    } else {
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = `report-${scan_id}.pdf`;
      if (contentDisposition && contentDisposition.includes("filename=")) {
        filename = contentDisposition.split("filename=")[1].replace(/["']/g, "");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  };

  if (loading) return <p className="text-white px-8">Loading...</p>;

  return (
    <div>
      {scanData.success === "empty" ? <motion.div className="w-full"
        key={scanData?.scan_id || scanData?.run_time}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}>
        <div className="bg-gradient-to-br from-gray-100 via-white to-gray-200 dark:from-gray-950 dark:via-black dark:to-gray-900 min-h-screen">
          <div className="pt-24 flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg"
                fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                stroke="currentColor" className="h-8 w-8">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-200">
              No Recent Scans available
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Start an action and get your scans.
            </p>
          </div>
        </div>
      </motion.div>
        :
        <motion.div className="w-full"
          key={scanData?.scan_id || scanData?.run_time}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}>
          <div className="relative px-10 flex flex-col gap-6 pt-24 pb-6 bg-gradient-to-br from-gray-100 via-white to-gray-200 dark:from-gray-950 dark:via-black dark:to-gray-900">
            <div className="flex flex-col gap-4 md:flex-row md:gap-6">
              <div className="flex bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-300 dark:border-gray-800 text-black dark:text-white px-6 py-6 md:px-8 md:py-10 flex-1">
                <div className="flex gap-4 md:gap-6 items-center">
                  {scanData && (
                    <FontAwesomeIcon
                      className={`${getStatusBg()} rounded-full py-4 px-3.5 text-xl md:text-2xl text-white`}
                      icon={getStatusIcon()}
                    />
                  )}
                  <div className="flex flex-col">
                    <h1 className="font-bold text-lg md:text-xl">Status</h1>
                    <h2 className="text-zinc-700 dark:text-zinc-300 text-sm md:text-base">
                      {scanData?.status === "success"
                        ? "All Secure"
                        : "Changes Found"}
                    </h2>
                  </div>
                </div>
              </div>
              <div className="flex bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-300 dark:border-gray-800 text-black dark:text-white px-6 py-6 md:px-8 md:py-10 flex-1">
                <div className="flex gap-4 md:gap-6 items-center">
                  <FontAwesomeIcon
                    className="bg-blue-500 rounded-full py-4 px-3.5 text-xl md:text-2xl text-white"
                    icon={faClock} />
                  <div className="flex flex-col">
                    <h1 className="font-bold text-lg md:text-xl">Last Checked</h1>
                    <h2 className="text-zinc-700 dark:text-zinc-300 text-sm md:text-base">
                      {new Date(scanData?.run_time).toLocaleString("en-GB", { hour12: false }) || "Not Available"}
                    </h2>
                  </div>
                </div>
              </div>
              <div className="flex bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-300 dark:border-gray-800 text-black dark:text-white px-6 py-6 md:px-8 md:py-10 flex-1">
                <div className="flex gap-4 md:gap-6 items-center">
                  <div className={`${scanData?.files_changed > 0 ? "bg-amber-600" : "bg-emerald-700"} rounded-full px-5 py-3 text-xl md:text-2xl text-white`}>
                    {(scanData?.files_changed || 0) + (scanData?.files_added || 0) + (scanData?.files_removed || 0)}
                  </div>
                  <div className="flex flex-col">
                    <h1 className="font-bold text-lg md:text-xl">Files Affected</h1>
                    <h2 className="text-zinc-700 dark:text-zinc-300 text-sm md:text-base">
                      In the last check
                    </h2>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative flex flex-col gap-6 sm:gap-8 md:gap-10 w-full">
      <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 w-full transition-all">
        <h2 className="font-semibold text-xl sm:text-2xl mb-4 text-gray-900 dark:text-gray-100 text-center sm:text-left">
          File Change Distribution
        </h2>

        {pieData.every(item => item.value === 0) ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center h-[250px] sm:h-[300px] md:h-[350px] text-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="bg-green-100 dark:bg-green-900/40 p-4 rounded-full">
                <FileCheck className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-lg font-medium">
                No File Changes Detected
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md">
                Everything looks consistent with the last accepted baseline.
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="w-full h-[250px] sm:h-[300px] md:h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius="80%"
                  label
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    color: "#333",
                  }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
            <div className="flex flex-col bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-300 dark:border-gray-800 text-black dark:text-white px-6 py-4 md:px-8 md:py-8 flex-1">
              <h1 className="font-bold text-2xl">Last Scan Results</h1>
              {scanData ? (
                <>
                  <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
                    Checked At: {new Date(scanData.run_time).toLocaleString("en-GB", { hour12: false })}
                  </p>
                  <p className="mt-1 text-sm">
                    Changed: {scanData.files_changed} | Added:{" "}
                    {scanData.files_added || 0} | Removed:{" "}
                    {scanData.files_removed || 0}
                  </p>
                  <ul className="mt-2 text-sm">
                    {scanData.recent_changes?.slice(0, 3).map((file, index) => (
                      <li key={index} className="border-b border-gray-700 py-1">
                        {file.path} — {file.changeType} ({file.attributes.join(", ")})
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-4 mt-4">
                    <button
                      onClick={(e) => handleView(e, scanData.scan_id)}
                      className="flex items-center gap-2 cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg shadow-md transition transform hover:scale-105 duration-200 focus:outline-none">
                      <FileTextIcon className="w-5 h-5" />
                      <span className="font-medium">View Report</span>
                    </button>
                    <button
                      onClick={(e) => handleDownload(e, scanData.scan_id)}
                      className="flex items-center gap-2 cursor-pointer bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg shadow-md transition transform hover:scale-105 duration-200 focus:outline-none">
                      <DownloadIcon className="w-5 h-5" />
                      <span className="font-medium">Download Report</span>
                    </button>
                  </div>
                  {isOpen && (
                    <ViewModal summary={summary} details={details} dbInfo={dbInfo} scanData={scanData} onOpen={setIsOpen} />
                  )}
                </>
              ) : (
                <p className="mt-2 text-sm text-zinc-400">
                  No recent scan results available
                </p>
              )}
            </div>
            <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-800 w-full">
              <h2 className="font-bold text-lg sm:text-xl mb-4 text-gray-900 dark:text-white text-center sm:text-left">
                Recent Scans Overview
              </h2>
              <div className="w-full h-[250px] sm:h-[300px] md:h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(label, payload) => {
                        if (payload && payload.length > 0) {
                          const time = payload[0].payload.Time;
                          return `${label} (${time})`;
                        }
                        return label;
                      }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                    <Bar dataKey="Changed" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="Added" fill="#10b981" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="Removed" fill="#ef4444" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </motion.div>
      }
    </div>
  );
}

export default Dashboard;
