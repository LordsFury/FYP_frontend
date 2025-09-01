"use client";

import { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Edit3, Save, X, Loader2, FileText } from "lucide-react";
import { toast } from "react-toastify";

function Settings() {
  const [config, setConfig] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `${import.meta.env.VITE_API_HOST}/api/aide/config`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (data.success) {
        setConfig(data.data);
        setIsEditing(true);
        toast.success(data.msg, {autoClose: 2000});
      }
    } catch (error) {
      console.error(error);
      toast.error("Error fetching config");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `${import.meta.env.VITE_API_HOST}/api/aide/config`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ config }),
        }
      );
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

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-200 dark:from-gray-950 dark:via-black dark:to-gray-900 flex justify-center px-4">
      <motion.div
        className="w-full max-w-4xl"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-8">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-8 h-8 text-yellow-500" />
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              AIDE Config Settings
            </h1>
          </div>
          {!isEditing ? (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleClick}
              disabled={loading}
              className="cursor-pointer bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-3 rounded-xl font-medium flex items-center gap-2 shadow-md transition-all disabled:opacity-70">
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
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-5">
              <textarea
                className="w-full h-96 p-4 rounded-xl text-sm font-mono border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-yellow-500 outline-none resize-none"
                value={config}
                onChange={(e) => setConfig(e.target.value)} />
              <div className="flex flex-wrap gap-3 justify-end">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-medium flex items-center gap-2 shadow-md transition-all disabled:opacity-70">
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" /> Save
                    </>
                  )}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 px-5 py-2 rounded-lg font-medium flex items-center gap-2 shadow-md transition-all">
                  <X className="w-5 h-5" /> Cancel
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default Settings;
