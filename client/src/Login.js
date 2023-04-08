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

    const [loggedIn, setLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    const onSubmit = async (e) => {
        e.preventDefault();
        const res = await axios.post("http://localhost:5000/login", { username, password });
        setAccessToken(res.headers['auth-token-access']);
        setRefreshToken(res.headers['auth-token-refresh']);
        setUser(res.data);
        console.log(user);
    };

    return (
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
            {/* <button type="button" value="Register" onClick={() => { setLogin("register"); }}>Register</button> */}
            {/* {showErr && <p>Something went wrong! Please try again</p>} */}
            <div>
                {
                    user ?
                        user.role === "admin" ?
                            <Dashboard />
                            :
                            <Main />
                        : <></>
                }
            </div>
        </>
    );
}

export default Login;