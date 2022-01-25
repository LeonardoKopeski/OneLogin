import {Component} from 'react'
import io from "socket.io-client"
import {getCookie} from '../../functions/cookies.js'
import {verifiedBadge, alternativePhoto} from "../../functions/const.js"
import "./style.css"

const buttonValues = [
    "Seguir",
    "Seguindo",
    "Seguidor",
    "Amigos",
    "Você mesmo!"
]

export default class Account extends Component{
    constructor(){
        super()

        this.socket = io("http://localhost:4000")

        this.state = {
            infoRequested: false,
            userInfo: {}
        }
        
        this.socket.on("basicInfoResponse", (res)=>{
            if(res.status === "Ok"){
                this.setState({userInfo: {...res}})
            }else{
                window.open("/notFound", "_SELF")
            }
        })

        this.follow = this.follow.bind(this)
    }
    componentDidMount(){
        if(this.state.infoRequested === false){
            const username = window.location.href.split("/")[4]
            this.socket.emit("getBasicInfo", {username, requester: getCookie("token")})
            this.setState({infoRequested: true})
        }
    }
    follow(){
        if(this.state.userInfo.samePerson || this.state.userInfo.following){
            return
        }
        if(getCookie("token") === ""){
            window.open("/login", "_SELF")
        }
        this.socket.emit("follow", {token: getCookie("token"), follow: this.state.userInfo.username})
        var userInfo = this.state.userInfo
        userInfo.following = true
        this.setState({userInfo})
    }
    render(){
        const userInfo = this.state.userInfo
        const colored = userInfo.friendStatus === 0 || userInfo.friendStatus === 2
        const buttonValue = buttonValues[userInfo.friendStatus]
        
        return(
        <div className="accountScreen">
            <header>
                <div id="logo" onClick={()=>window.open("/","_SELF")}>
                    <h1>OneLogin</h1>
                    <h2>By Leonardo Kopeski</h2>
                </div>
            </header>
            <div id="account">
                <img src={userInfo.imageUrl || alternativePhoto} style={{borderColor: userInfo.highlightColor}} alt="userImage"/>
                <h1 id="username">
                    @{userInfo.username}{userInfo.verified? verifiedBadge: null}
                </h1>
                <p id="bio">
                    "{userInfo.bio}"
                </p>
                <button onClick={this.follow} className={colored?"colored":""}>
                    {buttonValue}
                </button>
            </div>
        </div>
        )
    }
}