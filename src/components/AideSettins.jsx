"use client";
import { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import {
    FileText,
    Edit3,
    Loader2,
    Save,
    X,
    Plus,
    FolderPlus,
    ChevronLeft
} from "lucide-react";
import { toast } from "react-toastify";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useAuth from "../hooks/UseAuth";

const AideSettins = () => {
    useAuth();

    const [directories, setDirectories] = useState([]);
    const [rules, setRules] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    const [browsePath, setBrowsePath] = useState("/");
    const [dirOptions, setDirOptions] = useState([]);
    const [showBrowse, setShowBrowse] = useState(false);

    const getConfig = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("accessToken");
            const response = await fetch(
                `${import.meta.env.VITE_API_HOST}/api/aide/config/`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
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
            if (data.success) {
                setDirectories(data.directories);
                setRules(data.rules);
                setIsEditing(true);
            } else {
                toast.error(data.msg || "Failed to load config", { autoClose: 2000 });
            }
        } catch (error) {
            console.error(error);
            toast.error("Error fetching config", { autoClose: 2000 });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (index, field, value) => {
        const updated = [...directories];
        updated[index][field] = value;
        setDirectories(updated);
    };

    const handleAdd = (browsePath) => {
        if (typeof browsePath === "string" && browsePath.startsWith("/")) {
            setDirectories([...directories, { path: browsePath, rule: rules[0] }]);
            setBrowsePath("/");
        }
        else {
            setDirectories([...directories, { path: "", rule: rules[0] }]);
        }
    };

    const handleRemove = (index) => {
        setDirectories(directories.filter((_, i) => i !== index));
    };

    const handleRuleChange = (index, newRule) => {
        setDirectories((prev) =>
            prev.map((d, i) =>
                i === index ? { ...d, rule: newRule } : d
            )
        );
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("accessToken");
            const response = await fetch(
                `${import.meta.env.VITE_API_HOST}/api/aide/config/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ directories }),
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
                toast.success(data.msg, { autoClose: 2000 });
                setIsEditing(false);
            } else {
                toast.error(data.msg, { autoClose: 2000 });
            }
        } catch (error) {
            console.error(error);
            toast.error("Error saving config", { autoClose: 2000 });
        } finally {
            setLoading(false);
        }
    };

    const fetchDirectories = async (path = "/") => {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(`${import.meta.env.VITE_API_HOST}/api/browse/?path=${encodeURIComponent(path)}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
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
            setBrowsePath(path);
            setDirOptions(data.directories);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden p-4 sm:p-6 md:p-8">
            <div className="flex flex-col items-start">
                <div className="flex items-center gap-3 mb-6">
                    <FileText className="w-8 h-8 text-yellow-500" />
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-200">
                        AIDE Config Settings
                    </h1>
                </div>
                {!isEditing && (
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { getConfig(); setIsEditing(true); }}
                        disabled={loading}
                        className="cursor-pointer bg-yellow-500 hover:bg-yellow-600 text-white px-4 sm:px-5 py-2 sm:py-3 rounded-lg sm:rounded-xl font-medium flex items-center gap-2 shadow-md transition-all disabled:opacity-70 text-sm sm:text-base">
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" /> Loading...
                            </>
                        ) : (
                            <>
                                <Edit3 className="w-5 h-5" /> Edit Config
                            </>
                        )}
                    </motion.button>
                )}
            </div>
            {isEditing && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm sm:text-md border-collapse">
                            <thead className="bg-blue-800 text-white">
                                <tr>
                                    <th className="p-2 sm:p-3 sm:px-6 text-left">Directory</th>
                                    <th className="p-2 sm:p-3 sm:px-6 text-left">Rule</th>
                                    <th className="p-2 sm:p-3 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {directories.map((d, i) => (
                                    <tr key={i} className="border-t border-gray-200 dark:border-gray-700">
                                        <td className="p-2 sm:p-3">
                                            <input type="text" value={d.path} onChange={(e) => handleChange(i, "path", e.target.value)} className="w-full px-2 sm:px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-yellow-500 outline-none text-xs sm:text-sm" />
                                        </td>
                                        <td className="p-2 sm:p-3">
                                            <select value={d.rule} onChange={(e) => handleRuleChange(i, e.target.value)} className="w-full px-2 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all cursor-pointer appearance-none text-xs sm:text-sm">
                                                {rules.map((rule) => (
                                                    <option key={rule} value={rule}>
                                                        {rule}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="p-2 sm:p-3 text-center">
                                            <motion.button
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => handleRemove(i)}
                                                className="text-red-600 hover:text-red-700 dark:hover:text-red-600">
                                                <FontAwesomeIcon size="lg" icon={faTrash} />
                                            </motion.button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={handleAdd}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 shadow-md text-sm sm:text-base">
                            <Plus className="w-4 h-4 sm:w-5 sm:h-5" /> Add Directory
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => { fetchDirectories("/"); setShowBrowse(true); }}
                            className="bg-teal-600 hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-800 text-white px-3 sm:px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 shadow-md text-sm sm:text-base">
                            <FolderPlus className="w-4 h-4 sm:w-5 sm:h-5" /> Browse
                        </motion.button>
                        {showBrowse && (
                            <div className="fixed inset-0 bg-black/20 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
                                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-[90%] max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
                                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => {
                                                    if (browsePath !== "/") {
                                                        const parent =
                                                            browsePath.substring(0, browsePath.lastIndexOf("/")) || "/";
                                                        fetchDirectories(parent);
                                                    }
                                                }}
                                                disabled={browsePath === "/"}
                                                className={`flex items-center justify-center px-1 py-1 rounded-full ${browsePath === "/"
                                                    ? "bg-gray-200 dark:bg-gray-700 text-gray-400 shadow-none"
                                                    : "bg-blue-50 dark:bg-gray-800 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-gray-700 shadow-md"} transition`}>
                                                <ChevronLeft className="w-6 h-6" />
                                            </button>

                                            <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100 truncate">
                                                Browse: <span className="text-blue-600 dark:text-blue-400">{browsePath}</span>
                                            </h2>
                                        </div>
                                        <button
                                            onClick={() => setShowBrowse(false)}
                                            className="text-gray-500 hover:text-red-500 transition">
                                            ✕
                                        </button>
                                    </div>
                                    <div className="p-4 flex-1 overflow-y-auto">
                                        {dirOptions.length > 0 ? (
                                            <ul className="space-y-2">
                                                {dirOptions.filter((d) => d !== "/root").map((directory) => (
                                                    <li key={directory}>
                                                        <button
                                                            onClick={() => fetchDirectories(directory)}
                                                            className="w-full text-left px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition">
                                                            {directory}
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-gray-500 dark:text-gray-400 text-center">
                                                No directories found.
                                            </p>
                                        )}
                                    </div>
                                    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                                        <button
                                            onClick={() => setShowBrowse(false)}
                                            className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700 transition">
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => { handleAdd(browsePath); setShowBrowse(false); }}
                                            className="px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium shadow-md transition">
                                            Select
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-3 justify-end">
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSave}
                            disabled={loading}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 sm:px-5 py-2 rounded-lg font-medium flex items-center gap-2 shadow-md transition-all disabled:opacity-70 text-sm sm:text-base">
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" /> Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 sm:w-5 sm:h-5" /> Save
                                </>
                            )}
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsEditing(false)}
                            className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 sm:px-5 py-2 rounded-lg font-medium flex items-center gap-2 shadow-md transition-all text-sm sm:text-base">
                            <X className="w-4 h-4 sm:w-5 sm:h-5" /> Cancel
                        </motion.button>
                    </div>
                </motion.div>
            )}
        </div>
    )
}

export default AideSettins