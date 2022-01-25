import { Routes, Route } from "react-router-dom"
import "./style.css"

import Login from "./pages/login/login.js"
import Register from "./pages/register/register.js"
import DashboardHome from "./pages/dashboard/dashboard.js"
import DashboardFriendList from "./pages/dashboard/friendList/friendList.js"
import DashboardPersonalization from "./pages/dashboard/personalization/personalization.js"
import DashboardNotifications from "./pages/dashboard/notifications/notifications.js"
import Account from "./pages/account/account.js"
import FastLogin from "./pages/fastLogin/fastLogin.js"
import Logout from "./pages/logout/logout.js"
import NotFound from "./pages/notFound/notFound.js"
import DashboardApi from "./pages/dashboard/api/api.js"

function App(){
    return (
    <Routes>
        <Route path="/login" element={<Login/>}/>
        <Route path="/register" element={<Register/>}/>
        <Route path="/dashboard" element={<DashboardHome/>}/>
        <Route path="/dashboard/friendList" element={<DashboardFriendList/>}/>
        <Route path="/dashboard/personalization" element={<DashboardPersonalization/>}/>
        <Route path="/dashboard/notifications" element={<DashboardNotifications/>}/>
        <Route path="/dashboard/api" element={<DashboardApi/>}/>
        <Route path="/account/:username" element={<Account/>}/>
        <Route path="/fastLogin" element={<FastLogin/>}/>
        <Route path="/logout" element={<Logout/>}/>
        <Route path="*" element={<NotFound/>}/>
    </Routes>
    )
}

export default App