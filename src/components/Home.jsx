import Dashboard from "./Dashboard";
import Settings from "./Settings";
import Alerts from "./Alerts";
import History from "./History";
import { Route, Routes } from "react-router-dom";
import { useState } from "react";
import Navbar from "./Navbar";
import Login from "./Login";
import ForgetPassword from "./ForgetPassword";

function Home() {
  const [aideData, setAideData] = useState(null);

  return (
    <div>
      <Navbar onAideData={setAideData} />
      <Routes>
        <Route path="/" element={<Dashboard aideData={aideData} />} />
        <Route path="/history" element={<History onDeleted={(scanId) => { if(scanId === null ) { setAideData(null); } else if (aideData?.scan_id === scanId) { setAideData(null); }}} />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forget-password" element={<ForgetPassword />} />
      </Routes>
    </div>
  );
}

export default Home;
