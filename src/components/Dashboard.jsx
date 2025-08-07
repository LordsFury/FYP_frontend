import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../App.css";
import {
  faClock,
  faCheck,
  faWarning,
  faCross,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

function Dashboard({ aideData }) {
  const navigate=useNavigate();
  const getStatusIcon = () => {
    if (!aideData) return null;
    if (aideData.status === "success") return faCheck;
    if (aideData.status === "false") return faCross;
    return faWarning;
  };

  const getStatusBg = () => {
    if (!aideData) return "bg-gray-500";
    if (aideData.status === "success") return "bg-emerald-700";
    if (aideData.status === "false") return "bg-red-500";
    return "bg-yellow-500";
  };

  return (
    <div className="px-8 py-4 flex flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:gap-6">
        <div className="flex bg-gray-800 rounded-lg text-white px-6 py-4 md:px-8 md:py-6 flex-1">
          <div className="flex gap-4 md:gap-6 items-center">
            {aideData && (
              <FontAwesomeIcon
                className={`${getStatusBg()} rounded-full py-4 px-3.5 text-xl md:text-2xl`}
                icon={getStatusIcon()}
              />
            )}
            <div className="flex flex-col">
              <h1 className="font-bold text-lg md:text-xl">Status</h1>
              <h2 className="text-zinc-300 text-sm md:text-base">
                {aideData?.status === "success"
                  ? "All Secure"
                  : "Changes Found"}
              </h2>
            </div>
          </div>
        </div>
        <div className="flex bg-gray-800 rounded-lg text-white px-6 py-4 md:px-8 md:py-6 flex-1">
          <div className="flex gap-4 md:gap-6 items-center">
            <FontAwesomeIcon
              className="bg-blue-500 rounded-full py-4 px-3.5 text-xl md:text-2xl"
              icon={faClock}
            />
            <div className="flex flex-col">
              <h1 className="font-bold text-lg md:text-xl">Last Checked</h1>
              <h2 className="text-zinc-300 text-sm md:text-base">
                {aideData?.last_run || "Not Available"}
              </h2>
            </div>
          </div>
        </div>
        <div className="flex bg-gray-800 rounded-lg text-white px-6 py-4 md:px-8 md:py-6 flex-1">
          <div className="flex gap-4 md:gap-6 items-center">
            <div
              className={`${
                aideData?.files_changed > 0 ? "bg-amber-600" : "bg-emerald-700"
              } rounded-full px-5 py-3 text-xl md:text-2xl`}
            >
              {aideData?.files_changed || 0}
            </div>
            <div className="flex flex-col">
              <h1 className="font-bold text-lg md:text-xl">Files Changed</h1>
              <h2 className="text-zinc-300 text-sm md:text-base">
                In the last check
              </h2>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col bg-gray-800 rounded-lg text-white px-6 py-4 md:px-8 md:py-6 flex-1">
        <h1 className="font-bold text-lg">Last Scan Results</h1>

        {aideData ? (
          <>
            <p className="mt-1 text-sm text-zinc-300">
              Last Check: {aideData.last_run}
            </p>
            <p className="mt-1 text-sm">
              Changed: {aideData.files_changed} | Added:{" "}
              {aideData.files_added || 0} | Removed:{" "}
              {aideData.files_removed || 0}
            </p>
            <ul className="mt-2 text-sm">
              {aideData.recent_changes?.slice(0, 3).map((file, index) => (
                <li key={index} className="border-b border-gray-700 py-1">
                  {file.path} — {file.changeType} ({file.attributes.join(", ")})
                </li>
              ))}
            </ul>
            <div className="flex mt-2">
              <button
                onClick={() => navigate("/reports")}
                className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-1 rounded-lg cursor-pointer transition"
              >
                View Report
              </button>
            </div>
          </>
        ) : (
          <p className="mt-2 text-sm text-zinc-400">
            No recent scan results available
          </p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
