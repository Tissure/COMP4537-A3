import React, { useState } from "react";
import axios from 'axios';
import Dashboard from "./Dashboard";
import Main from "./Main";

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [accessToken, setAccessToken] = useState('');
    const [refreshToken, setRefreshToken] = useState('');
    const [user, setUser] = useState(null);

    const onSubmit = async (e) => {
        e.preventDefault();

        const res = await axios.post("http://localhost:5000/login", { username, password });
        setAccessToken(res.headers['auth-token-access']);
        setRefreshToken(res.headers['auth-token-refresh']);
        setUser(res.data);
    };

    const onLogout = async (e) => {
        e.preventDefault();
        await axios.get("http://localhost:5000/logout",
            {
                headers: {
                    Authorization: 'Bearer ' + accessToken
                }
            });
        setUsername('');
        setPassword('');
        setAccessToken('');
        setRefreshToken('');
        setUser(null);
    };

    return (
        <>
            {
                !user ?
                    <>
                        <label >
                            Username:
                            <input type="text" name="username" onChange={(e) => {
                                setUsername(e.target.value);
                            }} />
                        </label>
                        <label >
                            Password:
                            <input type="password" name="password" onChange={(e) => {
                                setPassword(e.target.value);
                            }} />
                        </label>
                        <button type="button" value="Submit" onClick={onSubmit}>Submit</button>
                    </>
                    : <>
                        <button type="button" value="Logout" onClick={onLogout}>Logout</button>
                    </>
            }
            <div>
                {
                    user ?
                        user.role === "admin" ?
                            <Dashboard accessToken={accessToken} setAccessToken={setAccessToken} refreshToken={refreshToken} />
                            :
                            <Main accessToken={accessToken} />
                        : <></>
                }
            </div>
        </>
    );
}

export default Login;