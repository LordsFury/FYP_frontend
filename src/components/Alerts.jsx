import { useEffect, useState, useMemo } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import useAuth from "../hooks/UseAuth";
import { faSearch, faTimesCircle, faTrash } from "@fortawesome/free-solid-svg-icons";
import { DownloadIcon, FileTextIcon } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import ViewModal from "./ViewModal";

function Alerts() {

  useAuth();

  const [alerts, setAlerts] = useState([]);
  const [searchChange, setSearchChange] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [visibleCount, setVisibleCount] = useState(10);
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

  const getAlerts = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${import.meta.env.VITE_API_HOST}/api/alerts/`, {
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
        return;
      }
      const data = await response.json();
      console.log(data)
      setAlerts(data)
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    getAlerts();
  }, []);

  const filtered = useMemo(() => {
    const q = (searchChange || "").toLowerCase();
    let list = alerts;
    if (q) {
      list = list.filter((data) => {
        const dateMatch = data.timestamp
          ? new Date(data.timestamp)
            .toLocaleString("en-GB", { hour12: false })
            .toLowerCase()
            .includes(q)
          : false;
        return dateMatch;
      });
    }
    return list;
  }, [alerts, searchChange]);

  const handleDelete = async (e, alert_id) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("accessToken");
      let response;
      if (alert_id) {
        response = await fetch(`${import.meta.env.VITE_API_HOST}/api/delete-alert/${alert_id}/`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });
      } else {
        const result = await Swal.fire({
          title: "Are you sure you want to clear Alerts History?",
          text: "This action cannot be undone!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Yes",
          cancelButtonText: "Cancel",
        });
        if (result.isConfirmed) {
          response = await fetch(`${import.meta.env.VITE_API_HOST}/api/delete-all-alerts/`, {
            method: "DELETE",
            headers: {
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
          if (data.success) {
            Swal.fire({
              title: "Alerts History Cleared!",
              text: data.output,
              icon: "success",
              confirmButtonColor: "#3085d6",
            });
          } else {
            Swal.fire({
              title: "Error!",
              text: data.output,
              icon: "error",
              confirmButtonColor: "#d33",
            });
          }
        }
      }
      getAlerts();
    }
    catch (error) {
      console.error(error);
    }
  }

  const handleSeeMore = () => {
    setVisibleCount((prev) => prev + 10);
  };

  const handleSeeLess = () => {
    setVisibleCount(5);
  };

  const handleView = async (e, scan) => {
    e.preventDefault();
    const scan_id = scan.id
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
    setSelectedItem(scan);
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

  return (
    <div className="bg-gradient-to-br from-gray-100 via-white to-gray-200 dark:from-gray-950 dark:via-black dark:to-gray-900 h-screen">
      {alerts.length === 0 ? <motion.div className="w-full"
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
            No alerts found
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Start an action and your alerts will appear here.
          </p>
        </div>
      </motion.div> :
        <motion.div className="w-full"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}>
          <div className="pt-24 pb-6 px-4 bg-gradient-to-br from-gray-100 via-white to-gray-200 dark:from-gray-950 dark:via-black dark:to-gray-900 h-full">
            <div className="px-8 mb-5 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-300 dark:border-gray-800 px-3 py-2 w-2/3 focus-within:ring-2 focus-within:ring-blue-500">
                  <FontAwesomeIcon icon={faSearch} className="text-gray-600 dark:text-gray-400 mr-2" />
                  <input type="text" placeholder="Search by Date..." onChange={(e) => { setSearchChange(e.target.value) }} value={searchChange}
                    className="bg-transparent text-gray-800 placeholder:text-gray-700 dark:text-gray-200 dark:placeholder-gray-400 outline-none w-full" />
                  {searchChange && (
                    <FontAwesomeIcon icon={faTimesCircle} className="text-gray-400 hover:text-red-500 cursor-pointer" onClick={() => setSearchChange("")} />
                  )}
                </div>
                <button onClick={handleDelete} className="cursor-pointer flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition">
                  <FontAwesomeIcon icon={faTrash} />
                  <span className="hidden sm:inline">Clear Alerts History</span>
                </button>
              </div>
              <div className="mt-3 text-sm text-gray-600 dark:text-gray-400 mx-4 flex justify-start">
                {searchChange &&
                  <div>
                    Found {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
                  </div>
                }
              </div>
            </div>
            <div className="py-4 flex flex-col gap-8">
              {filtered.slice(0, visibleCount).map((item, index) => (
                <div key={index} className="text-black dark:text-white px-6 md:px-8 flex-1">
                  <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-300 dark:border-gray-800 px-8 py-5 transition hover:shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
                          {item.status || "AIDE Alert"}
                        </h2>
                        <p className="text-sm text-zinc-700 dark:text-zinc-300 mt-1">
                          Host: <span className="font-medium">{item.host}</span>
                        </p>
                        <p className="text-sm text-zinc-700 dark:text-zinc-300">
                          Checked At:{" "}
                          <span className="font-medium">
                            {new Date(item.timestamp).toLocaleString("en-GB", {
                              hour12: false,
                            })}
                          </span>
                        </p>
                      </div>
                      <button
                        title="Delete Alert"
                        className="text-red-500 hover:text-red-600 transition"
                        onClick={(e) => handleDelete(e, item.id)}
                      >
                        <FontAwesomeIcon icon={faTrash} className="text-lg" />
                      </button>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-3 border border-zinc-200 dark:border-zinc-700">
                      <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed">
                        {item.summary}
                      </p>
                      <div className="flex flex-wrap gap-6 mt-1 text-sm">
                        <span className="text-blue-600 dark:text-blue-400">
                          Changed: <strong>{item.files_changed}</strong>
                        </span>
                        <span className="text-green-600 dark:text-green-400">
                          Added: <strong>{item.files_added}</strong>
                        </span>
                        <span className="text-red-600 dark:text-red-400">
                          Removed: <strong>{item.files_removed}</strong>
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-5">
                      <button
                        onClick={(e) => handleView(e, item)}
                        className="flex items-center gap-2 cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg shadow-md transition transform hover:scale-105 duration-200 focus:outline-none"
                      >
                        <FileTextIcon className="w-5 h-5" />
                        <span className="font-medium">View Report</span>
                      </button>

                      <button
                        onClick={(e) => handleDownload(e, item.id)}
                        className="flex items-center gap-2 cursor-pointer bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg shadow-md transition transform hover:scale-105 duration-200 focus:outline-none"
                      >
                        <DownloadIcon className="w-5 h-5" />
                        <span className="font-medium">Download Report</span>
                      </button>
                    </div>
                    {isOpen && (
                      <ViewModal summary={summary} details={details} dbInfo={dbInfo} scanData={selectedItem} onOpen={setIsOpen} />
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-4">
              {visibleCount < filtered.length ? (
                <button onClick={handleSeeMore} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">
                  See More
                </button>
              ) : filtered.length > 5 && (
                <button onClick={handleSeeLess} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition">
                  See Less
                </button>
              )}
            </div>
          </div>
        </motion.div>
      }
    </div>
  )
}

export default Alerts;