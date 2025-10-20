"use client";
import useAuth from "../hooks/UseAuth";
import LoginSettings from "./LoginSettings";
import AideSettins from "./AideSettins";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import AutocheckSettings from "./AutocheckSettings";

function Settings() {
  useAuth();

  return (
    <div className="pt-12 pb-6 min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-200 dark:from-gray-950 dark:via-black dark:to-gray-900 flex justify-center px-4">
      <motion.div
        className="w-full max-w-4xl flex flex-col gap-6"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}>
        <LoginSettings />
        <AideSettins />
        <AutocheckSettings />
      </motion.div>
    </div>
  );
}

export default Settings;
