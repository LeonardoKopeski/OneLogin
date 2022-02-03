import {Component} from 'react'
import io from "socket.io-client"
import { getCookie } from '../../../functions/cookies.js'
import { returnSVG} from "../../../functions/const.js"
import "./style.css"

export default class DashboardServices extends Component{
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

        this.socket.on("userInfoResponse", (res)=>{
            if(res.status === "Ok"){
                localStorage.setItem("loggedUserInfo", JSON.stringify(res))
                this.setState({userInfo: {...res}})
            }else{
                window.open("/logout", "_SELF")
            }
        })

        this.makeList = this.makeList.bind(this)
        this.disconnect = this.disconnect.bind(this)
    }
    componentDidMount(){
        if(this.state.infoRequested === false){
            this.socket.emit("getUserInfo", {token: getCookie("token")})
            this.setState({infoRequested: true})
        }
    }
    disconnect(name){
        var index = 0
        this.state.userInfo.services.forEach(elm => {
            if(elm.name === name){
                index = 0
            }
        })

        var update = {...this.state.userInfo}
        update.services.splice(index, 1)
        
        this.socket.emit("disconnectService", {name: name, token: getCookie("token")})

        this.setState({userInfo: update})
    }
    makeList(){
        return this.state.userInfo.services.map((elm, index) => {
            return(
            <li key={index}>
                <h1>{elm.name}</h1>
                <a href={elm.termsUrl}>{elm.termsUrl}</a>
                <button onClick={()=>this.disconnect(elm.name)}>Negar acesso</button>
            </li>
            )
        })
    }
    render(){
        return (
        <ul className="serviceList">
            <li id="header">
                <div onClick={()=>window.open("/dashboard", "_SELF")}>
                    {returnSVG}
                </div>
                <h2>
                    Serviços
                </h2>
            </li>
            {this.makeList()}
        </ul>
        )
    }
}