import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faSearch,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import useAuth from '../hooks/UseAuth';
import { toast } from "react-toastify";
import { DownloadIcon, FileTextIcon } from "lucide-react";
import Swal from "sweetalert2";
import ViewModal from "./ViewModal";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

function History({ onDeleted }) {

  useAuth();

  const [allData, setAllData] = useState([]);
  const [visibleCount, setVisibleCount] = useState(10);
  const [searchChange, setSearchChange] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
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

  const getAllData = async () => {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(`${import.meta.env.VITE_API_HOST}/api/all-data/`, {
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
    if (data.success) {
      setLoading(false);
      setAllData(data.allData);
    }
  };

  useEffect(() => {
    getAllData();
  }, []);

  const filtered = useMemo(() => {
    const q = (searchChange || "").toLowerCase();
    let list = allData;
    if (q) {
      list = list.filter((data) => {
        const dateMatch = data.run_time
          ? new Date(data.run_time)
            .toLocaleString("en-GB", { hour12: false })
            .toLowerCase()
            .includes(q)
          : false;
        return dateMatch;
      });
    }
    return list;
  }, [allData, searchChange]);

  const handleDelete = async (e, scan_id) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("accessToken");
      let response;
      if (scan_id) {
        response = await fetch(`${import.meta.env.VITE_API_HOST}/api/delete-data/${scan_id}/`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });
        onDeleted(scan_id);
      } else {
        const result = await Swal.fire({
          title: "Are you sure you want to clear History?",
          text: "This action cannot be undone!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Yes",
          cancelButtonText: "Cancel",
        });
        if (result.isConfirmed) {
          response = await fetch(`${import.meta.env.VITE_API_HOST}/api/delete-all-data/`, {
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
              title: "History Cleared!",
              text: data.output,
              icon: "success",
              confirmButtonColor: "#3085d6",
            });
            onDeleted(null);
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
      getAllData();
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
    const scan_id = scan.id;
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
    setSelectedItem(scan)
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
    <div className="bg-gradient-to-br from-gray-100 via-white to-gray-200 dark:from-gray-950 dark:via-black dark:to-gray-900 h-screen">
      {!allData ? <motion.div className="w-full"
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
            No history found
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Start an action and your history will appear here.
          </p>
        </div>
      </motion.div> :
        <motion.div className="w-full"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}>
          <div className="pt-24 pb-6 px-4 bg-gradient-to-br from-gray-100 via-white to-gray-200 dark:from-gray-950 dark:via-black dark:to-gray-900">
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
                  <span className="hidden sm:inline">Clear History</span>
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
                  {item ? (
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-300 dark:border-gray-800 px-8 py-4">
                      <h2 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
                        {item.status === "success" ? "All Secure" : "Changes Found"}
                      </h2>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
                            Checked At:{" "}
                            <span className="font-medium">
                              {new Date(item.run_time).toLocaleString("en-GB", {
                                hour12: false,
                              })}
                            </span>
                          </p>
                          <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed">
                            {item.summary}
                          </p>
                          <div className="flex flex-wrap gap-6 mt-2 text-sm">
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
                          <ul className="mt-2 text-sm">
                            {item.recent_changes?.slice(0, 3).map((file, index) => (
                              <li key={index} className="border-b border-gray-700 py-1">
                                {file.path} — {file.changeType} (
                                {file.attributes.join(", ")})
                              </li>
                            ))}
                          </ul>
                          <div className="flex flex-wrap gap-4 mt-4">
                            <button
                              onClick={(e) => handleView(e, item)}
                              className="flex items-center gap-2 cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg shadow-md transition transform hover:scale-105 duration-200 focus:outline-none">
                              <FileTextIcon className="w-5 h-5" />
                              <span className="font-medium">View Report</span>
                            </button>
                            <button
                              onClick={(e) => handleDownload(e, item.id)}
                              className="flex items-center gap-2 cursor-pointer bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg shadow-md transition transform hover:scale-105 duration-200 focus:outline-none">
                              <DownloadIcon className="w-5 h-5" />
                              <span className="font-medium">Download Report</span>
                            </button>
                          </div>
                          {isOpen && (
                            <ViewModal summary={summary} details={details} dbInfo={dbInfo} scanData={selectedItem} onOpen={setIsOpen} />
                          )}
                        </div>
                        <button onClick={(e) => { handleDelete(e, item.id) }}>
                          <FontAwesomeIcon className="text-red-500 text-lg cursor-pointer hover:text-red-600" icon={faTrash} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-zinc-400">No history available</p>
                  )}
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
  );
}

export default History;
