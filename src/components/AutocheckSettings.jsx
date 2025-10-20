"use client";
import { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import {
    Edit3,
    Loader2,
    Save,
    X,
    Clock
} from "lucide-react";
import { toast } from "react-toastify";
import useAuth from "../hooks/UseAuth";

const AutocheckSettings = () => {
    useAuth();

    const [schedule, setSchedule] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [custom, setCustom] = useState("");
    const [error, setError] = useState("");

    const getSchedule = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("accessToken");
            const response = await fetch(`${import.meta.env.VITE_API_HOST}/api/auto-check/`, {
                headers: { Authorization: `Bearer ${token}` },
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
                setSchedule(data.schedule);
                setCustom(data.schedule);
            } else toast.error(data.msg || "Failed to load timer settings");
        } catch (e) {
            console.error(e);
            toast.error("Error fetching settings");
        } finally {
            setLoading(false);
        }
    };

    const validateSchedule = (value) => {
        const allowedPresets = ["daily", "weekly", "monthly"];
        const pattern = /^(\*|\d{4})-(\*|0[1-9]|1[0-2])-(\*|0[1-9]|[12]\d|3[01])\s([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;

        if (allowedPresets.includes(value.toLowerCase()) || pattern.test(value)) {
            setError("");
            return true;
        } else {
            setError(
                "Invalid format. Use 'daily', 'weekly', 'monthly' or custom format like '*-*-* 14:30:00'."
            );
            return false;
        }
    };


    const handleSave = async () => {
        const finalValue = schedule === "custom" ? custom.trim() : schedule;
        if (!validateSchedule(finalValue)) return;
        try {
            setLoading(true);
            const token = localStorage.getItem("accessToken");
            const response = await fetch(`${import.meta.env.VITE_API_HOST}/api/auto-check/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ schedule: finalValue }),
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
                toast.success("Schedule updated successfully!");
                setIsEditing(false);
                setSchedule(finalValue);
            } else {
                toast.error(data.message || "Failed to update schedule");
            }
        } catch (e) {
            console.error(e);
            toast.error("Error saving schedule");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden p-4 sm:p-6 md:p-6">
            <div className="flex flex-col items-start">
                <div className="flex items-center gap-3 mb-6">
                    <Clock className="w-8 h-8 text-green-600" />
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-200">
                        Automatic Alert Schedule
                    </h1>
                </div>
                {!isEditing && (
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { getSchedule(); setIsEditing(true); }}
                        disabled={loading}
                        className="cursor-pointer bg-green-600 hover:bg-green-700 text-white px-4 sm:px-5 py-2 sm:py-3 rounded-lg sm:rounded-xl font-medium flex items-center gap-2 shadow-md transition-all disabled:opacity-70 text-sm sm:text-base">
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" /> Loading...
                            </>
                        ) : (
                            <>
                                <Edit3 className="w-5 h-5" /> Edit Schedule
                            </>
                        )}
                    </motion.button>
                )}
            </div>
            {isEditing && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                    <p className="text-gray-700 dark:text-gray-300 text-lg">
                        <strong>Current Schedule:</strong>{" "}
                        <span className="text-blue-600 dark:text-blue-400">
                            {schedule || "Not configured"}
                        </span>
                    </p>
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Select Schedule Type:
                        </label>
                        <div className="relative">
                            <select
                                value={schedule}
                                onChange={(e) => setSchedule(e.target.value)}
                                className="w-full appearance-none p-3 pr-10 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
                            >
                                <option value="">-- Choose a schedule --</option>
                                <option value="daily">Daily (midnight)</option>
                                <option value="weekly">Weekly (Monday 00:00)</option>
                                <option value="monthly">Monthly (1st 00:00)</option>
                                <option value="custom">Custom</option>
                            </select>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                    {schedule === "custom" && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Custom Schedule (Systemd format):
                            </label>
                            <input
                                type="text"
                                value={custom}
                                onChange={(e) => setCustom(e.target.value)}
                                onBlur={(e) => validateSchedule(e.target.value)}
                                placeholder="e.g. *-*-* 14:00:00"
                                className={`w-full p-3 rounded-lg border ${error
                                    ? "border-red-500 focus:ring-red-500"
                                    : "border-gray-300 dark:border-gray-700 focus:ring-blue-500"
                                    } bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-200 outline-none`}
                            />
                            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                        </div>
                    )}
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
                                    <Save className="w-4 h-4 sm:w-5 sm:h-5" /> Save Schedule
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

export default AutocheckSettings