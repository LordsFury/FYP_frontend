"use client";

import { useState, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Edit3, Save, X, Loader2, FileText, User2Icon } from "lucide-react";
import { toast } from "react-toastify";
import useAuth from '../hooks/UseAuth';

function Settings() {
  useAuth();

  const [config, setConfig] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [username, setUserName] = useState("");


  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(`${import.meta.env.VITE_API_HOST}/api/current-admin/`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setUserName(data.username);
        } else {
          toast.error("Failed to fetch user info");
        }
      } catch (error) {
        console.log(error);
        toast.error("Server error while fetching user info");
      }
    };

    fetchCurrentUser();
  }, []);


  const handleClick = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `${import.meta.env.VITE_API_HOST}/api/aide/config/`, // trailing slash important
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
        window.location.href = "/login";
        return;
      }

      const data = await response.json();

      if (data.success) {
        setConfig(data.data);
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
          body: JSON.stringify({ config }),
        }
      );
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
      } else {
        const data = await response.json();
        if (data.success) {
          toast.success(data.msg, { autoClose: 2000 });
          setIsEditing(false);
        } else {
          toast.error(data.msg, { autoClose: 2000 });
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Error saving config", { autoClose: 2000 });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (username === "") {
      toast.error("Username cannot be empty");
      return;
    }
    if (newPassword && newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    setLoadingProfile(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${import.meta.env.VITE_API_HOST}/api/update-profile/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          username,
          current_password: currentPassword,
          new_password: newPassword
        })
      });
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
      } else {
        const data = await response.json();
        if (data.success) {
          toast.success(data.msg, { autoClose: 2000 });
          setIsEditingProfile(false);
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
          if (data.force_logout) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            setTimeout(() => {
              window.location.href = "/login";
            }, 2000);
          }
        } else {
          toast.error(data.msg, { autoClose: 2000 });
        }
      }
    } catch (error) {
      console.log(error);
      toast.error("Server error. Try again");
    } finally {
      setLoadingProfile(false);
    }
  };


  return (
    <div className="pt-20 min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-200 dark:from-gray-950 dark:via-black dark:to-gray-900 flex justify-center px-4">
      <motion.div
        className="w-full max-w-4xl flex flex-col gap-8"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-8 mt-10">
          <div className="flex items-center gap-3 mb-6">
            <User2Icon className="w-8 h-8 text-indigo-500" />
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              Admin Profile Settings
            </h1>
          </div>
          {!isEditingProfile ? (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsEditingProfile(true)}
              className="cursor-pointer bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-3 rounded-xl font-medium flex items-center gap-2 shadow-md transition-all"
            >
              <Edit3 className="w-5 h-5" /> Edit Profile
            </motion.button>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUserName(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <input
                  type="password"
                  placeholder="Current Password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div className="flex flex-wrap gap-3 justify-end">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSaveProfile}
                  className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-medium flex items-center gap-2 shadow-md transition-all">
                  {loadingProfile ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-5 h-5" /> Save
                    </>
                  )}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditingProfile(false)}
                  className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 px-5 py-2 rounded-lg font-medium flex items-center gap-2 shadow-md transition-all"
                >
                  <X className="w-5 h-5" /> Cancel
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
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
