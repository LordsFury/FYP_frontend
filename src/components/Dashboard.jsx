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
import { DownloadIcon, FileTextIcon } from "lucide-react";
import ViewModal from "./ViewModal";
function Dashboard({ aideData }) {
  useAuth();

  const [lastScan, setLastScan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dbInfo, setDbInfo] = useState([]);
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

  const fetchscanData = async () => {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(`${import.meta.env.VITE_API_HOST}/api/last-scan/`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      }
    });
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
    } else {
      const data = await response.json();
      if (data.success) {
        setLastScan(data);
      }
      setLoading(false);
    }

  }

  useEffect(() => {
    fetchscanData();
  }, []);

  const scanData = aideData || lastScan;

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
      window.location.href = "/login";
    } else {
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
      window.location.href = "/login";
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
          <div className="relative px-10 flex flex-col gap-6 pt-24 bg-gradient-to-br from-gray-100 via-white to-gray-200 dark:from-gray-950 dark:via-black dark:to-gray-900 h-screen">
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
                    icon={faClock}/>
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
                  <div className={`${scanData?.files_changed > 0 ? "bg-amber-600" : "bg-emerald-700" } rounded-full px-5 py-3 text-xl md:text-2xl text-white`}>
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
            <div className="flex flex-col bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-300 dark:border-gray-800 text-black dark:text-white px-6 py-4 md:px-8 md:py-6 flex-1">
              <h1 className="font-bold text-lg">Last Scan Results</h1>
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
          </div>
        </motion.div>
      }
    </div>

  );
}

export default Dashboard;
