import {Component} from 'react'
import io from "socket.io-client"
import {getCookie} from '../../../functions/cookies.js'
import {returnSVG} from "../../../functions/const.js";
import "./style.css"

const notificationStyles = {
    "friendRequest": {
        defaultTitle: "Alguém",
        defaultText: "Novo pedido de amizade",
        image: <svg className="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path fill="currentColor" d="M224 256c70.7 0 128-57.31 128-128S294.7 0 224 0C153.3 0 96 57.31 96 128S153.3 256 224 256zM274.7 304H173.3c-95.73 0-173.3 77.6-173.3 173.3C0 496.5 15.52 512 34.66 512H413.3C432.5 512 448 496.5 448 477.3C448 381.6 370.4 304 274.7 304zM479.1 320h-73.85C451.2 357.7 480 414.1 480 477.3C480 490.1 476.2 501.9 470 512h138C625.7 512 640 497.6 640 479.1C640 391.6 568.4 320 479.1 320zM432 256C493.9 256 544 205.9 544 144S493.9 32 432 32c-25.11 0-48.04 8.555-66.72 22.51C376.8 76.63 384 101.4 384 128c0 35.52-11.93 68.14-31.59 94.71C372.7 243.2 400.8 256 432 256z"></path></svg>,
        buttonText: "Aceitar"
    },
    "message": {
        defaultTitle: "Alguém",
        defaultText: "Nova mensagem",
        image: <svg className="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M511.6 36.86l-64 415.1c-1.5 9.734-7.375 18.22-15.97 23.05c-4.844 2.719-10.27 4.097-15.68 4.097c-4.188 0-8.319-.8154-12.29-2.472l-122.6-51.1l-50.86 76.29C226.3 508.5 219.8 512 212.8 512C201.3 512 192 502.7 192 491.2v-96.18c0-7.115 2.372-14.03 6.742-19.64L416 96l-293.7 264.3L19.69 317.5C8.438 312.8 .8125 302.2 .0625 289.1s5.469-23.72 16.06-29.77l448-255.1c10.69-6.109 23.88-5.547 34 1.406S513.5 24.72 511.6 36.86z"></path></svg>,
        buttonText: "Abrir"
    },
    "verifiedAccount": {
        defaultTitle: "Serviço de verificação",
        defaultText: "Sua conta foi verificada!",
        image: <svg className="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="m512 268c0 17.9-4.3 34.5-12.9 49.7s-20.1 27.1-34.6 35.4c.4 2.7.6 6.9.6 12.6 0 27.1-9.1 50.1-27.1 69.1-18.1 19.1-39.9 28.6-65.4 28.6-11.4 0-22.3-2.1-32.6-6.3-8 16.4-19.5 29.6-34.6 39.7-15 10.2-31.5 15.2-49.4 15.2-18.3 0-34.9-4.9-49.7-14.9-14.9-9.9-26.3-23.2-34.3-40-10.3 4.2-21.1 6.3-32.6 6.3-25.5 0-47.4-9.5-65.7-28.6-18.3-19-27.4-42.1-27.4-69.1 0-3 .4-7.2 1.1-12.6-14.5-8.4-26-20.2-34.6-35.4-8.5-15.2-12.8-31.8-12.8-49.7 0-19 4.8-36.5 14.3-52.3s22.3-27.5 38.3-35.1c-4.2-11.4-6.3-22.9-6.3-34.3 0-27 9.1-50.1 27.4-69.1s40.2-28.6 65.7-28.6c11.4 0 22.3 2.1 32.6 6.3 8-16.4 19.5-29.6 34.6-39.7 15-10.1 31.5-15.2 49.4-15.2s34.4 5.1 49.4 15.1c15 10.1 26.6 23.3 34.6 39.7 10.3-4.2 21.1-6.3 32.6-6.3 25.5 0 47.3 9.5 65.4 28.6s27.1 42.1 27.1 69.1c0 12.6-1.9 24-5.7 34.3 16 7.6 28.8 19.3 38.3 35.1 9.5 15.9 14.3 33.4 14.3 52.4zm-266.9 77.1 105.7-158.3c2.7-4.2 3.5-8.8 2.6-13.7-1-4.9-3.5-8.8-7.7-11.4-4.2-2.7-8.8-3.6-13.7-2.9-5 .8-9 3.2-12 7.4l-93.1 140-42.9-42.8c-3.8-3.8-8.2-5.6-13.1-5.4-5 .2-9.3 2-13.1 5.4-3.4 3.4-5.1 7.7-5.1 12.9 0 5.1 1.7 9.4 5.1 12.9l58.9 58.9 2.9 2.3c3.4 2.3 6.9 3.4 10.3 3.4 6.7-.1 11.8-2.9 15.2-8.7z"/></svg>,
        buttonText: null
    }
}

export default class DashboardNotifications extends Component{
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

        this.socket.emit("viewNotifications", {token: getCookie("token")})
        this.makeList = this.makeList.bind(this)
    }
    componentDidMount(){
        if(this.state.infoRequested === false){
            this.socket.emit("getUserInfo", {token: getCookie("token")})
            this.setState({infoRequested: true})
        }
    }
    makeList(){
        return this.state.userInfo.notifications.map((elm, index) => {
            var style = notificationStyles[elm.type]

            var functions = {
                "friendRequest": ()=>{
                    this.socket.emit("follow", {token: getCookie("token"), follow: elm.by})
                }
            }

            return (
            <li key={index} className={elm.viewed? "viewed": ""}>
                {style.image}
                <h1>{elm.by || style.defaultTitle}</h1>
                <h2>{elm.text || style.defaultText}</h2>
                {style.buttonText?
                    <div>
                        <button onClick={functions[elm.type]}>
                            {style.buttonText}
                        </button>
                    </div>
                :null}
            </li>
            )
        })
    }
    render(){
        return (
        <ul className="notifications">
            <li id="header">
                <div onClick={()=>window.open("/dashboard", "_SELF")}>{returnSVG}</div>
                <h2>
                    Notificações
                </h2>
            </li>
            {this.makeList()}
        </ul>
        )
    }
}