import axios from 'axios';
import { React, useState, useEffect } from 'react';
import jwt_decode from "jwt-decode";

function Report({ id, accessToken, setAccessToken, refreshToken }) {

    const [data, setData] = useState([]);
    const [barChartData, setBarChartData] = useState({});
    const [tableData, setTableData] = useState([]);
    const [thead, setThead] = useState([]);
    const [title, setTitle] = useState([]);

    const headers = {
        "Content-Type": "application/json",
        authorization: `Refresh ${localStorage.getItem("token")}`,
    };

    const handleUniqueUsers = async () => {
        setBarChartData({});
        setTableData([]);
        const res = await axios.get(
            "http://localhost:6001/api/v1/admin/uniqueUsers",
            { headers }
        );

        setData(res.data);
    };

    const handleTopUsers = async () => {
        setData([]);
        setTableData([]);
        const res = await axios.get(
            "http://localhost:6001/api/v1/admin/topUsers",
            {
                headers,
            }
        );
        console.log(res.data);
        setTitle("Top API users");
        setBarChartData({
            labels: res.data.map((user) => user._id),
            datasets: [
                {
                    label: "Number of requests",
                    data: res.data.map((user) => user.count),
                    backgroundColor: "rgba(255, 99, 132, 0.5)",
                },
            ],
        });
    };

    const handleTopUsersPerEndpoint = async () => {
        setData([]);
        setBarChartData({});
        const res = await axios.get(
            "http://localhost:6001/api/v1/admin/topUsersPerEndpoint",
            { headers }
        );
        setTitle("Top users per endpoint");
        console.log(res.data);
        const data = res.data.map((e) => [e._id.endpoint, e._id.user, e.count]);
        setThead(["Endpoint", "User", "Count"]);
        setTableData(data);
    };

    const handle4xxErrorByEndpoint = async () => {
        const res = await axios.get(
            "http://localhost:6001/api/v1/admin/errorsByEndpoint",
            { headers }
        );
        console.log(res.data);
        const data = res.data.map((e) => [e._id, e.count]);
        setThead(["Endpoint", "Count"]);
        setTableData(data);
    };

    const handleRecent4xx5xxErrors = async () => {
        const res = await axios.get(
            "http://localhost:6001/api/v1/admin/recentErrors",
            { headers }
        );
        console.log(res.data);
        setThead(["Endpoint", "User", "Status", "Timestamp"]);
        const data = res.data.map((e) => [
            e.endpoint,
            e.user,
            e.status,
            e.timestamp,
        ]);
        setTableData(data);
    };

    // useEffect(() => {
    //     switch (id) {
    //         case 1:
    //             handleUniqueUsers();
    //             break;
    //         // case 2:
    //         //     handleTopUsers();
    //         //     break;
    //         // case 3:
    //         //     handleTopUsersPerEndpoint();
    //         //     break;
    //         // case 4:
    //         //     handle4xxErrorByEndpoint();
    //         //     break;
    //         // case 5:
    //         //     handleRecent4xx5xxErrors();
    //         //     break;
    //     }
    // });
    return (
        <div>
            Report {id}
            {
                (tableData) &&
                tableData
            }
        </div>
    );
}

export default Report;