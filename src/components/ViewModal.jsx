
const getIcon = (type) => {
    switch (type) {
        case "Directory":
            return <span className="mr-1">📂</span>;
        case "File":
            return <span className="mr-1">📄</span>;
        case "Link":
            return <span className="mr-1">🔗</span>;
        default:
            return <span className="mr-1">❓</span>;
    }
};

const ViewModal = ({ summary, details, dbInfo, scanData, onOpen }) => {
    return (
        <div
            className="fixed inset-0 flex items-center justify-center bg-black/70 z-50"
            onClick={() => onOpen(false)}>
            <div
                className="bg-white dark:bg-gray-900 shadow-2xl w-[95%] max-w-5xl p-6 relative transform transition-all duration-300 animate-fadeInUp overflow-y-auto max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}>
                <button
                    onClick={() => onOpen(false)}
                    className="absolute top-4 right-4 text-gray-500 hover:text-red-600 text-xl">
                    ✖
                </button>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                    🛡️ AIDE Scan Report
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Generated on{" "}
                    <span className="font-medium">
                        {new Date(scanData.run_time).toLocaleString("en-GB", { hour12: false })}
                    </span>
                </p>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    📊 Summary
                </h3>
                <div className="overflow-x-auto mb-6">
                    <table className="w-full text-sm border border-white">
                        <thead>
                            <tr className="bg-blue-900 text-white text-center">
                                <th className="p-2 border border-black dark:border-white">Start</th>
                                <th className="p-2 border border-black dark:border-white">End</th>
                                <th className="p-2 border border-black dark:border-white">Scanned</th>
                                <th className="p-2 border border-black dark:border-white">Added</th>
                                <th className="p-2 border border-black dark:border-white">Removed</th>
                                <th className="p-2 border border-black dark:border-white">Changed</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="text-center">
                                <td className="p-2 border border-black dark:border-white">{summary.startTimestamp}</td>
                                <td className="p-2 border border-black dark:border-white">{summary.endTimestamp}</td>
                                <td className="p-2 border border-black dark:border-white">{summary.totalFiles}</td>
                                <td className="p-2 border border-black dark:border-white">{summary.filesAdded}</td>
                                <td className="p-2 border border-black dark:border-white">{summary.filesRemoved}</td>
                                <td className="p-2 border border-black dark:border-white">{summary.filesChanged}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                {dbInfo?.length > 0 && (
                    <>
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">
                            ℹ️ Database Information
                        </h3>
                        <div className="overflow-x-auto mb-6">
                            <table className="w-full text-sm border border-gray-300 dark:border-gray-700">
                                <tbody>
                                    {dbInfo.map((line, i) => (
                                        <tr key={i} className="border-b border-gray-200 dark:border-gray-700">
                                            <td className="p-2">{line}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
                \{(details.addedFiles?.length > 0 || details.removedFiles?.length > 0 || details.changedFiles?.length > 0) && (
                    <>
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">
                            📂 File Changes
                        </h3>
                        <div className="overflow-x-auto mb-6">
                            <table className="w-full text-sm border border-white table-fixed">
                                <thead>
                                    <tr className="bg-blue-900 text-white text-center">
                                        <th className="p-2 border border-white w-1/3">Added</th>
                                        <th className="p-2 border border-white w-1/3">Removed</th>
                                        <th className="p-2 border border-white w-1/3">Changed</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="text-center align-top">
                                        <td className="p-2 border border-white break-words">
                                            {details.addedFiles?.length > 0 ? (
                                                details.addedFiles.map((f, i) => {
                                                    const cleaned = f.replace(/^[-•\s]+/, "").trim();
                                                    return cleaned ? <div key={i}>{cleaned}</div> : null;
                                                })
                                            ) : "—"}
                                        </td>
                                        <td className="p-2 border border-white break-words">
                                            {details.removedFiles?.length > 0 ? (
                                                details.removedFiles.map((f, i) => {
                                                    const cleaned = f.replace(/^[-•\s]+/, "").trim();
                                                    return cleaned ? <div key={i}>{cleaned}</div> : null;
                                                })
                                            ) : "—"}
                                        </td>
                                        <td className="p-2 border border-white break-words">
                                            {details.changedFiles?.length > 0 ? (
                                                details.changedFiles.map((f, i) => {
                                                    const cleaned = f.replace(/^[-•\s]+/, "").trim();
                                                    return cleaned ? <div key={i}>{cleaned}</div> : null;
                                                })
                                            ) : "—"}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
                {details.detailedInfo?.length > 0 && (
                    <>
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">
                            🔍 Detailed Differences
                        </h3>
                        {details.detailedInfo.map((file, idx) => (
                            <div key={idx} className="mb-8">
                                <h4 className="font-semibold text-base text-gray-900 dark:text-gray-100 mb-2">
                                    {getIcon(file.type)} {file.path}
                                </h4>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-center text-xs border border-gray-300 dark:border-gray-700">
                                        <thead>
                                            <tr className="bg-blue-900 text-white">
                                                <th className="p-2 border w-[20%]">Attribute</th>
                                                <th className="p-2 border w-[40%]">Old Value</th>
                                                <th className="p-2 border w-[40%]">New Value</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {file.changes.map((ch, i) => (
                                                <tr
                                                    key={i}
                                                    className="odd:bg-gray-50 even:bg-white dark:odd:bg-gray-800/40 dark:even:bg-gray-900"
                                                >
                                                    <td className="p-2 border font-medium text-gray-800 dark:text-gray-200">
                                                        {ch.attribute}
                                                    </td>
                                                    <td className="p-2 border font-mono text-gray-700 dark:text-gray-300">
                                                        {ch.old}
                                                    </td>
                                                    <td className="p-2 border font-mono text-gray-700 dark:text-gray-300">
                                                        {ch.new}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}
                    </>
                )}
                {details.dbAttributes && Object.keys(details.dbAttributes).length > 0 && (
                    <>
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">
                            🗄️ Database Attributes
                        </h3>
                        <div className="overflow-x-auto mb-6">
                            <table className="w-full text-xs text-center border border-white table-fixed">
                                <thead>
                                    <tr className="bg-blue-900 text-white">
                                        <th className="p-2 border border-white w-1/3">Attribute</th>
                                        <th className="p-2 border border-white w-2/3">Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(details.dbAttributes).map(([k, v], i) => (
                                        <tr
                                            key={i}
                                            className="odd:bg-gray-50 even:bg-white dark:odd:bg-gray-800/40 dark:even:bg-gray-900">
                                            <td className="p-2 border border-white font-medium">{k}</td>
                                            <td className="p-2 border border-white font-mono break-words">{v}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default ViewModal