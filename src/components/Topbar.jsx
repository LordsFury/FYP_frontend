import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../App.css';
import {
    faUser
} from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom';
import { useState } from 'react';

function Topbar({onAideData}) {

    const [loading, setLoading] = useState(false);

    const handleRunCheck = async () => {
        setLoading(true);

        try {
            const response = await fetch('http://192.168.41.133:8000/api/run-check/', { method: 'GET' });
            const data = await response.json();
            console.log(data)
            onAideData(data)
        } catch (error) {
            console.log(error);
            onAideData({status: false, output: 'Error running AIDE check.'});
        }
        setLoading(false);
    }

    return (
        <div className='border-b border-gray-800 py-4 px-10 w-full'>
            <div className='flex justify-end items-center gap-6'>
                <button onClick={handleRunCheck} disabled={loading} className={`${loading ? 'bg-blue-600' : 'bg-teal-700 hover:bg-teal-800'} text-white px-4 py-1 rounded-lg cursor-pointer transition`}>{loading ? 'Running...' : 'Run Check'}</button>
                <Link to="/profile" className='bg-slate-700 text-white px-2 py-1 rounded-full hover:bg-slate-800 transition'><FontAwesomeIcon icon={faUser} /></Link>
            </div>
        </div>
    )
}

export default Topbar;