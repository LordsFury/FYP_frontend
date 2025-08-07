import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../App.css';
import {
    faChartBar,
    faFolder,
    faCog,
    faBell,
    faHistory
} from '@fortawesome/free-solid-svg-icons'
import { Link, useLocation } from 'react-router-dom';

function Sidebar() {

    const location = useLocation();
    const path = location.pathname;

    return (
        <div className="flex flex-col h-full w-full lg:w-64 border-r border-gray-800 bg-gray-900">
            <div className="border-b border-gray-800 py-5.5 px-4 sm:py-4.5 md:py-4.5 lg:py-4.5 xl:py-4.5 sm:px-6 md:px-10">
                <h1 className="text-white font-bold text-sm sm:text-lg md:text-xl lg:text-xl">AIDE Monitor</h1>
            </div>
            <div className="flex flex-col gap-2 p-4 text-base text-zinc-300 lg:text-lg">
                <Link to="/" className={`flex items-center gap-4 py-2 px-3 rounded-lg ${path === '/' ? 'bg-gray-800 text-white' : 'hover:bg-gray-700'}`}>
                    <FontAwesomeIcon icon={faChartBar} className={path === '/' ? 'text-blue-400' : ''} />
                    <span>Dashboard</span>
                </Link>
                <Link to="/reports" className={`flex items-center gap-4 py-2 px-3 rounded-lg ${path === '/reports' ? 'bg-gray-800 text-white' : 'hover:bg-gray-700'}`}>
                    <FontAwesomeIcon icon={faFolder} className={path === '/reports' ? 'text-blue-400' : ''} />
                    <span>Reports</span>
                </Link>
                <Link to="/settings" className={`flex items-center gap-4 py-2 px-3 rounded-lg ${path === '/settings' ? 'bg-gray-800 text-white' : 'hover:bg-gray-700'}`}>
                    <FontAwesomeIcon icon={faCog} className={path === '/settings' ? 'text-blue-400' : ''} />
                    <span>Settings</span>
                </Link>
                <Link to="/alerts" className={`flex items-center gap-4 py-2 px-3 rounded-lg ${path === '/alerts' ? 'bg-gray-800 text-white' : 'hover:bg-gray-700'}`}>
                    <FontAwesomeIcon icon={faBell} className={path === '/alerts' ? 'text-blue-400' : ''} />
                    <span>Alerts</span>
                </Link>
                <Link to="/history" className={`flex items-center gap-4 py-2 px-3 rounded-lg ${path === '/history' ? 'bg-gray-800 text-white' : 'hover:bg-gray-700'}`}>
                    <FontAwesomeIcon icon={faHistory} className={path === '/history' ? 'text-blue-400' : ''} />
                    <span>History</span>
                </Link>
            </div>
        </div>
    )
}

export default Sidebar;       