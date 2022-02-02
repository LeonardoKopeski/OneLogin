import {Component} from 'react'
import io from "socket.io-client"
import { getCookie } from '../../../functions/cookies.js'
import {verifiedBadge, returnSVG, alternativePhoto} from "../../../functions/const.js"
import "./style.css"

export default class DashboardFriendList extends Component{
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
    }
    componentDidMount(){
        if(this.state.infoRequested === false){
            this.socket.emit("getUserInfo", {token: getCookie("token")})
            this.setState({infoRequested: true})
        }
    }
    makeList(){
        return this.state.userInfo.friendList.map((elm, index) => {
            return(
            <li key={index}>
                <img src={elm.imageUrl || alternativePhoto} alt="friend"/>
                <h1>@{elm.username}{elm.verified?verifiedBadge:null}</h1>
                <h2>{elm.bio}</h2>
            </li>
            )
        })
    }
    render(){
        return (
        <ul className="friendList">
            <li id="header">
                <div onClick={()=>window.open("/dashboard", "_SELF")}>
                    {returnSVG}
                </div>
                <h2>
                    Amigos
                </h2>
            </li>
            {this.makeList()}
        </ul>
        )
    }
}