import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Dashboard from './Dashboard';
import Reports from './Reports';
import Settings from './Settings';
import Alerts from './Alerts';
import History from './History';
import { useLocation } from 'react-router-dom';
import {useState} from 'react';

function Home() {

    const location = useLocation();
    const path = location.pathname;
    const [aideData, setAideData] = useState(null);

    return (
        <div className="w-screen min-h-screen bg-gray-800 py-6 px-4 md:px-6 lg:px-10">
            <div className="flex flex-row bg-gray-900 rounded-xl shadow-lg h-full w-full overflow-hidden">
                <div className="w-1/3 lg:w-1/4 xl:w-1/5">
                    <Sidebar />
                </div>
                <div className="flex flex-col w-full">
                    <Topbar onAideData={setAideData} />
                    {(() => {
                        if (path === '/') {
                            return <Dashboard aideData={aideData} />;
                        } else if (path === '/reports') {
                            return <Reports />;
                        } else if (path === '/settings') {
                            return <Settings />;
                        } else if (path === '/alerts') {
                            return <Alerts />;
                        } else if (path === '/history') {
                            return <History />;
                        }
                        else {
                            return <></>; 
                        }
                    })()}

                </div>
            </div>
        </div>

    )
}

export default Home;