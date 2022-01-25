import {Component} from 'react'
import io from "socket.io-client"
import {postData} from "../../functions/strings.js";
import {getCookie} from '../../functions/cookies.js'
import {alternativePhoto} from "../../functions/const.js"
import "./style.css"

const permissions = {
    "GetBasicData": "Ver seus dados basicos (nome de usuário, foto, biografia, etc...)",
    "GetFriendList": "Ver sua lista de amigos"
}

export default class FastLogin extends Component{
    constructor(){
        super()

        this.socket = io("http://localhost:4000")

        var localData = localStorage.getItem("loggedUserInfo")
        try{
            localData = JSON.parse(localData)
        }catch(err){
            localData = undefined
        }

        this.state = {
            infoRequested: false,
            userInfo: localData || {},
            apiInfo: {},
            page: 1
        }
        
        this.socket.on("userInfoResponse", (res)=>{
            if(res.status ===  "Ok"){
                localStorage.setItem("loggedUserInfo", JSON.stringify(res))
                this.setState({userInfo: {...res}})
            }else{
                window.open("/login?returnTo=" + window.location.pathname + window.location.search, "_SELF")
            }
        })

        this.socket.on("apiInfoResponse", (res)=>{
            if(res.status ===  "Ok"){
                this.setState({apiInfo: {...res}})
            }else{
                alert("Invalid LoginRequest, returning...")
                window.open(document.referrer || "/", "_SELF")
            }
        })

        this.socket.on("loginResponse", (res)=>{
            if(res.status ===  "Ok"){
                postData(res.returnTo, {token: res.token})
            }else{
                alert("Invalid LoginRequest, returning...")
                window.open(document.referrer || "/", "_SELF")
            }
        })

        this.login = this.login.bind(this)
        this.getPermissionList = this.getPermissionList.bind(this)
    }
    login(){
        const urlParams = new URLSearchParams(window.location.search)
        const loginToken = urlParams.get('loginToken')
        this.socket.emit("fastLogin", {token: getCookie("token"), loginToken: loginToken})
    }
    getPermissionList(){
        const warnPermissions = []
        return this.state.apiInfo.permissions.map(elm => {
            return(
            <li className={warnPermissions.indexOf(elm) !==  -1? "warn": ""} key={elm}>
                {permissions[elm] || ""}
            </li>
            )
        })
    }
    componentDidMount(){
        if(this.state.infoRequested ===  false){
            this.socket.emit("getUserInfo", {token: getCookie("token")})
            this.socket.emit("getLoginApiInfo", {loginToken: new URLSearchParams(window.location.search).get("loginToken")})
            this.setState({infoRequested: true})
        }
    }
    render(){
        const userInfo = this.state.userInfo
        const apiInfo = this.state.apiInfo
        
        return(
        <div className="fastLoginScreen">
            <header>
                <div id="logo" onClick={()=>window.open("/","_SELF")}>
                    <h1>OneLogin</h1>
                    <h2>By Leonardo Kopeski</h2>
                </div>
            </header>
            {this.state.page ===  1?
                <div id="account">
                    <h1>Entrar rapimente com OneLogin</h1>
                    <img src={userInfo.imageUrl || alternativePhoto} style={{borderColor: userInfo.highlightColor}} alt="userImage"/>
                    <h1 id="username">
                        @{userInfo.username}
                    </h1>
                    <button onClick={()=>this.setState({page: 2})}>Proximo</button>
                </div>
            :
                <div id="account">
                    <h1>{apiInfo.name} poderá:</h1>
                    <ul id="permissionList">
                        {this.getPermissionList()}
                    </ul>
                    <p id="disclaimer">
                        Ao prosseguir, você aceita todos os&nbsp;
                        <a href={apiInfo.termsUrl}>
                            termos de uso
                        </a>
                        &nbsp;de "{apiInfo.name}"
                    </p>
                    <button className="colored" onClick={this.login}>Login</button>
                </div>
            }
        </div>
        )
    }
}