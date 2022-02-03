import { Routes, Route } from "react-router-dom"
import "./style.css"

import Login from "./pages/login/login"
import Register from "./pages/register/register"
import DashboardHome from "./pages/dashboard/dashboard"
import DashboardFriendList from "./pages/dashboard/friendList/friendList"
import DashboardPersonalization from "./pages/dashboard/personalization/personalization"
import DashboardNotifications from "./pages/dashboard/notifications/notifications"
import Account from "./pages/account/account"
import FastLogin from "./pages/fastLogin/fastLogin"
import Logout from "./pages/logout/logout"
import NotFound from "./pages/notFound/notFound"
import DashboardApi from "./pages/dashboard/api/api"
import Docs from "./pages/docs/docs"
import CreateAPI from "./pages/createAPI/createAPI"
import ForgotPassword from "./pages/forgotPassword/forgotPassword"
import DashboardServices from "./pages/dashboard/services/services"
import Home from "./pages/home/home"

const pageTitles = {
    "/login": "Login",
    "/register": "Registro",
    "/dashboard": "Dashboard",
    "/account": "Conta",
    "/fastLogin": "Login rápido",
    "/logout": "Logout",
    "/docs": "Documentação",
    "/createAPI": "Criação de API",
    "/forgotPassword": "Redefinição de senha",
    "/": "Home Page"
}

function App(){
    var page = "/" + window.location.pathname.split("/")[1]
    document.title = "OneLogin - " + (pageTitles[page] || "404 Page")
    return (
        <Routes>
            <Route path="/login" element={<Login/>}/>
            <Route path="/register" element={<Register/>}/>
            <Route path="/dashboard" element={<DashboardHome/>}/>
            <Route path="/dashboard/friendList" element={<DashboardFriendList/>}/>
            <Route path="/dashboard/personalization" element={<DashboardPersonalization/>}/>
            <Route path="/dashboard/notifications" element={<DashboardNotifications/>}/>
            <Route path="/dashboard/api" element={<DashboardApi/>}/>
            <Route path="/dashboard/services" element={<DashboardServices/>}/>
            <Route path="/account/:username" element={<Account/>}/>
            <Route path="/fastLogin" element={<FastLogin/>}/>
            <Route path="/logout" element={<Logout/>}/>
            <Route path="/docs" element={<Docs/>}/>
            <Route path="/createAPI" element={<CreateAPI/>}/>
            <Route path="/forgotPassword" element={<ForgotPassword/>}/>
            <Route path="/" element={<Home/>}/>
            <Route path="*" element={<NotFound/>}/>
        </Routes>
    )
}

export default App