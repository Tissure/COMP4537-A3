import React, { useEffect, useState } from "react";
import Report from './Report';



import {
    Routes,
    Route,
    Link
} from "react-router-dom";


function Dashboard({ accessToken, setAccessToken, refreshToken }) {
    const [days, setDays] = useState({ afterDay: '2020-01-01', beforeDay: '2024-01-01' });
    return (
        <div>Dashboard

            <ul>
                <li><Link to="/report/1">Report 1 - Unique API users over a period of time</Link></li>
                <li><Link to="/report/2">Report 2 - Top API users over period of time</Link></li>
                <li><Link to="/report/3">Report 3 - Top users for each Endpoint</Link></li>
                <li><Link to="/report/4">Report 4 - 4xx Errors By Endpoint</Link></li>
                <li><Link to="/report/5">Report 5 - Recent 4xx/5xx Error</Link></li>
            </ul>
            <label>After day:</label>
            <input type="date" value={days.afterDay} onChange={e => setDays({ ...days, afterDay: e.target.value })} />
            <label>Before day:</label>
            <input type="date" value={days.beforeDay} onChange={e => setDays({ ...days, beforeDay: e.target.value })} />



            <Routes>
                <Route path="/report/1" element={<Report id={1} accessToken={accessToken} setAccessToken={setAccessToken} refreshToken={refreshToken} />} />
                <Route path="/report/2" element={<Report id={2} accessToken={accessToken} setAccessToken={setAccessToken} refreshToken={refreshToken} />} />
                <Route path="/report/3" element={<Report id={3} accessToken={accessToken} setAccessToken={setAccessToken} refreshToken={refreshToken} />} />
                <Route path="/report/4" element={<Report id={4} accessToken={accessToken} setAccessToken={setAccessToken} refreshToken={refreshToken} />} />
                <Route path="/report/5" element={<Report id={5} accessToken={accessToken} setAccessToken={setAccessToken} refreshToken={refreshToken} />} />
            </Routes>
        </div>
    );
}

export default Dashboard;