import {Component} from 'react'
import io from "socket.io-client"
import {Link} from "react-router-dom"
import {getCookie} from '../../functions/cookies.js'
import {copy} from "../../functions/strings.js"
import {notificationSVG, alternativePhoto} from "../../functions/const.js"
import "./style.css"

export default class DashboardHome extends Component{
    constructor(){
        super()

        this.socket = io("http://localhost:4000")

        if(getCookie("token") === ""){
            window.open("/login", "_SELF")
        }
    
        var localData = localStorage.getItem("loggedUserInfo")
        try{
            localData = JSON.parse(localData)
        }catch(err){
            localData = undefined
        }

        this.state = {
            infoRequested: false,
            userInfo: localData || {}
        }

        this.notificationCount = 0
        
        this.socket.on("userInfoResponse", (res)=>{
            if(res.status === "Ok"){
                res.notifications.forEach(elm=>{
                    if(!elm.viewed){ this.notificationCount++ }
                })
                localStorage.setItem("loggedUserInfo", JSON.stringify(res))
                this.setState({userInfo: {...res}})
            }else{
                window.open("/logout", "_SELF")
            }
        })

        this.openNotifications = this.openNotifications.bind(this)
    }
    componentDidMount(){
        if(this.state.infoRequested === false){
            this.socket.emit("getUserInfo", {token: getCookie("token")})
            this.setState({infoRequested: true})
        }
    }
    openNotifications(ev){
        ev.target.classList.remove("alert")
        this.notificationCount = 0

        window.open("/dashboard/notifications", "_SELF")
    }
    render(){
        const userInfo = this.state.userInfo
        return (
        <div className="dashboardScreen">
            <header>
                <div id="logo" onClick={()=>window.open("/","_SELF")}>
                    <h1>OneLogin</h1>
                    <h2>By Leonardo Kopeski</h2>
                </div>
                <div id="right">
                    <div id="notification" className={this.notificationCount === 0? "": "alert"} onClick={this.openNotifications}>
                        <span id="notificationCount">{this.notificationCount}</span>
                        {notificationSVG}
                    </div>
                </div>
            </header>
            <img style={{borderColor: userInfo.highlightColor}} src={userInfo.imageUrl || alternativePhoto} alt="Profile"/>
            <h1 id="username" onClick={()=>{
                var res = window.confirm("Copiar o link da sua conta?")
                if(!res){return}
                copy(window.location.origin + "/account/" + userInfo.username)
            }}>Ol?? {userInfo.username}!</h1>

            <nav className="homeSubpage">
                <div className="block" data-size="half">
                    <h1>Amigos</h1>
                    <p>Voc?? pode adicionar e remover amigos, enviar mensagens diretas, bloquear pessoas, etc...</p>
                    <Link to="/dashboard/friendList">
                        Abrir lista de amigos
                    </Link>
                </div>
                <div className="block" data-size="half">
                    <h1>Personaliza????o</h1>
                    <p>Voc?? pode personalizar sua conta editando seu username, foto de perfil, ou at?? sua cor de destaque!</p>
                    <Link to="/dashboard/personalization">
                        Personalizar minha conta
                    </Link>
                </div>
                <div className="block" data-size="full">
                    <h1>Servi??os conectados</h1>
                    <p>Aqui voc?? v?? quais servi??os podem ver ou controlar sua conta e bloqueia servi??os indesejados</p>
                    <Link to="/dashboard/services">
                        Abrir painel de servi??os conectados
                    </Link>
                </div>
                <div className="block" data-size="full">
                    <h1>Desenvolvimento</h1>
                    <p>Aqui voc?? controla seu token de API, podendo bloquear, mudar nome, editar configura????es, etc...</p>
                    <Link to={this.state.userInfo.hasApi?"/dashboard/api": "/createAPI"}>
                        Abrir painel do desenvolvedor
                    </Link>
                </div>
            </nav>        
        </div>
        )
    }
}