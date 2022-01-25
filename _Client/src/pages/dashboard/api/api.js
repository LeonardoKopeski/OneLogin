import {Component} from 'react'
import io from "socket.io-client"
import {getCookie} from '../../../functions/cookies.js'
import { returnSVG } from '../../../functions/const.js'
import "./style.css"

const translatedPermissions = {
    "LOGIN": "Fazer logins",
    "GETFRIENDLIST": "Obter listas de amigos"   
}

export default class DashboardApi extends Component{
    constructor(){
        super()

        this.state = {
            apiInfo: {},
            infoRequested: false
        }
        this.socket = io("http://localhost:4000")

        this.socket.on("updateApiNameResponse", ({status})=>{
            var input = document.querySelector("input#name")
            if(status === "updated"){
                this.setState({...this.state.apiInfo, name: input.value})
                alert("Atualizado!")
            }else{
                input.value = this.state.apiInfo.name
                input.focus()
                alert("Este nome de api já existe!")
            }
        })
        this.socket.on("apiInfoResponse", (res)=>{
            if(res.status === "Ok"){
                this.setState({apiInfo: {...res}})
            }else{
                window.open("/createApi", "_SELF")
            }
        })

        this.saveChanges = this.saveChanges.bind(this)
        this.generatePermissionList = this.generatePermissionList.bind(this)
        this.disconnectUsers = this.disconnectUsers.bind(this)
    }
    componentDidMount(){
        if(this.state.infoRequested === false){
            this.socket.emit("getApiInfo", {token: getCookie("token")})
            this.setState({infoRequested: true})
        }
    }
    generatePermissionList(originalPermissions = []){
        var permissions = []
        originalPermissions.forEach(elm => {
            if(translatedPermissions[elm] !== undefined){
                permissions.push(<p className='value' key={elm}>{translatedPermissions[elm]}</p>)
            }
        })
        return permissions
    }
    disconnectUsers(){
        this.socket.emit("disconnectApiUsers", {token: getCookie("token")})
        this.setState({apiInfo: {...this.state.apiInfo, users: 0}})
    }
    async saveChanges(ev){
        var value = ev.target.value

        if(this.state.apiInfo[ev.target.id] === value){ return }

        switch (ev.target.id){
            case "name":
                this.socket.emit("updateApiName", {token: getCookie("token"), name: value})
                return
            case "termsUrl":
                this.socket.emit("updateTermsUrl", {token: getCookie("token"), termsUrl: value})
                break
            default:
                return
        }

        var update = {...this.state.apiInfo}
        update[ev.target.id] = value
        this.setState({apiInfo: update})
        localStorage.setItem("loggedapiInfo", JSON.stringify(update))
        alert("Atualizado!")
    }
    render(){
        return (
        <ul className="api">
            <li id="header">
                <div onClick={()=>window.open("/dashboard", "_SELF")}>
                    {returnSVG}
                </div>
                <h2>
                    Painel do desenvolvedor
                </h2>
            </li>
            <li>
                <span className="key">Nome</span>
                <input
                    className="value"
                    onBlur={this.saveChanges}
                    placeholder="name"
                    id="name"
                    defaultValue={this.state.apiInfo.name}
                />
            </li>
            <li>
                <span className="key">Termos de uso</span>
                <input
                    className="value"
                    onBlur={this.saveChanges}
                    placeholder="termsUrl"
                    id="termsUrl"
                    defaultValue={this.state.apiInfo.termsUrl}
                />
            </li>
            <li>
                <span className="key">Permissões</span>
                {this.generatePermissionList(this.state.apiInfo.permissions)}
                <button className="value" onClick={()=>window.open("dashboard/manageApiPermissions")}>Alterar permissões</button>
            </li>
            <li>
                <span className="key">Usuarios</span>
                <p className='value'>Usuarios conectados: {this.state.apiInfo.users}</p>
                <button className="value" onClick={this.disconnectUsers}>Desconectar todos os usuarios</button>
            </li>
        </ul>
        )
    }
}