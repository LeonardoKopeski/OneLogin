import {Component} from 'react'
import io from "socket.io-client"
import {setCookie} from '../../functions/cookies.js'
import regEx from '../../functions/regex.js'
import {sha256} from '../../functions/encryption.js'
import "./style.css" 

export default class Login extends Component{
    constructor(){
        super()

        this.socket = io("http://localhost:4000")

        this.state = {
            emailTriggered: false,
            passwordTriggered: false,
            email: "",
            password: ""
        }

        this.socket.on("loginResponse", (res)=>{
            if(res.status === "Ok"){
                setCookie("token", res.token, 365)
                const returnTo = new URLSearchParams(window.location.search).get('returnTo')
                window.open(window.location.origin + (returnTo || "/dashboard"), "_SELF")
            }else{
                alert("Email e/ou senha invalidos!")
            }
        })

        this.setValue = this.setValue.bind(this)
        this.submit = this.submit.bind(this)
    }
    setValue(ev){
        var obj = {}
        obj[ev.target.id] = ev.target.value
        obj[ev.target.id + "Triggered"] = false
        this.setState(obj)
    }
    async submit(){
        var email = this.state.email
        var password = this.state.password
        var ok = true

        if(!regEx.email.test(email)){
            this.setState({emailTriggered: true})
            ok = false
        }
        if(password.length < 5){
            this.setState({passwordTriggered: true})
            ok = false
        }

        if(ok){
            password = await sha256(password)
            this.socket.emit("login", {email, password})
        }
    }
    render(){
        return(
            <div className="loginScreen">
                <header>
                    <div id="logo" onClick={()=>window.open("/","_SELF")}>
                        <h1>OneLogin</h1>
                        <h2>By Leonardo Kopeski</h2>
                    </div>
                </header>
                <form>
                    <h1>OneLogin</h1>
                    <h2>Faça login na sua conta!</h2>
                    <input
                        style={{borderColor: this.state.emailTriggered ? "#FA1133" : "#5603AD"}}
                        type="email"
                        id="email"
                        placeholder="Email"
                        onKeyUp={this.setValue}
                    /><br/>
                    <input
                        style={{borderColor: this.state.passwordTriggered ? "#FA1133" : "#5603AD"}}
                        type="password"
                        id="password"
                        placeholder="Senha"
                        onKeyUp={this.setValue}
                    /><br/>
                    <a href="/forgotPassword">Esqueci minha senha!</a><br/>
                    <input
                        type="button"
                        id="btnBack"
                        onClick={()=>window.open("/register", "_SELF")}
                        value="Registrar-se"
                    />
                    <input
                        type="button"
                        id="btnSubmit"
                        value="Login"
                        onClick={this.submit}
                    />
                </form>
            </div>
        )
    }
}