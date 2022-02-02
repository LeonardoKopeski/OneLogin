import {Component} from 'react'
import io from "socket.io-client"
import {getCookie} from '../../../functions/cookies.js'
import {reduceFileSize, getBase64} from "../../../functions/images.js"
import { returnSVG } from '../../../functions/const.js'
import "./style.css"

export default class DashboardPersonalization extends Component{
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
            console.log(res)
            if(res.status === "Ok"){
                localStorage.setItem("loggedUserInfo", JSON.stringify(res))
                this.setState({userInfo: {...res}})
            }else{
                window.open("/logout", "_SELF")
            }
        })

        this.socket.on("updateUsernameResponse", ({status})=>{
            var input = document.querySelector("input#username")
            if(status === "updated"){
                this.setState({...this.state.userInfo, username: input.value})
            }else{
                input.value = this.state.userInfo.username
                input.focus()
                alert("Este nome de usuário já existe!")
            }
        })

        this.saveChanges = this.saveChanges.bind(this)
        this.fileToBase64 = this.fileToBase64.bind(this)
    }
    UNSAFE_componentWillMount(){
        if(this.state.infoRequested === false){
            this.socket.emit("getUserInfo", {token: getCookie("token")})
            this.setState({infoRequested: true})
            this.forceUpdate()
        }
    }
    componentDidMount(){
        document.querySelector("#highlightColor").addEventListener("change", this.saveChanges, false)
    }
    async saveChanges(ev){
        var value = ev.target.type === "file" ? await this.fileToBase64(ev.target.files[0]) : ev.target.value

        if(this.state.userInfo[ev.target.id] === value){ return }

        switch (ev.target.id){
            case "bio":
                this.socket.emit("updateBio", {token: getCookie("token"), bio: value})
                break
            case "imageUrl":
                this.socket.emit("updateImage", {token: getCookie("token"), imageUrl: value})
                break
            case "username":
                this.socket.emit("updateUsername", {token: getCookie("token"), username: value})
                return
            case "highlightColor":
                this.socket.emit("updateHighlightColor", {token: getCookie("token"), color: value})
                break
            default:
                return
        }

        var update = {...this.state.userInfo}
        update[ev.target.id] = value
        this.setState({userInfo: update})
        //localStorage.setItem("loggedUserInfo", JSON.stringify(update))
        alert("Atualizado!")
    }
    fileToBase64(file){
        return new Promise((resolve)=>{
            reduceFileSize(file, 500*1024, 750, 750, 3, async blob => {
                getBase64(blob).then(resolve)
            })
        })
    }
    render(){
        return (
        <ul className="personalization">
            <li id="header">
                <div onClick={()=>window.open("/dashboard", "_SELF")}>
                    {returnSVG}
                </div>
                <h2>
                    Personalização
                </h2>
            </li>
            <li>
                <span className="key">Nome de usuário</span>
                <input
                    className="value"
                    onBlur={this.saveChanges}
                    placeholder="username"
                    id="username"
                    defaultValue={this.state.userInfo.username}
                />
            </li>
            <li>
                <span className="key">Biografia</span>
                <input
                    className="value"
                    onBlur={this.saveChanges}
                    placeholder="bio"
                    id="bio"
                    defaultValue={this.state.userInfo.bio}
                />
            </li>
            <li>
                <span className="key">Email</span>
                <span className="value">{this.state.userInfo.email}</span>
            </li>
            <li>
                <span className="key">Foto de perfil</span>
                <input
                    style={{display: "none"}}
                    onChange={this.saveChanges}
                    id="imageUrl"
                    type="file"
                />
                <label htmlFor="imageUrl" className="value">
                    Trocar foto de perfil
                </label>
            </li>
            <li>
                <span className="key">Cor de destaque</span>
                <input
                    style={{display: "none"}}
                    id="highlightColor"
                    type="color"
                    defaultValue={this.state.userInfo.highlightColor}
                />
                <label htmlFor="highlightColor" style={{borderColor: this.state.userInfo.highlightColor, color: this.state.userInfo.highlightColor}} className="value">
                    Mudar minha cor de destaque
                </label>
            </li>
        </ul>
        )
    }
}