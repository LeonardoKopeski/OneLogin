import {Component} from 'react'
import io from "socket.io-client"
import {setCookie} from '../../functions/cookies.js'
import regEx from '../../functions/regex.js'
import {sha256} from '../../functions/encryption.js'
import "../login/style.css" 

export default class Register extends Component{
    constructor(){
        super()

        this.socket = io("http://localhost:4000")

        this.state = {
            usernameTriggered: false,
            emailTriggered: false,
            passwordTriggered: false,
            username: "",
            email: "",
            password: ""
        }
        
        this.socket.on("verifiedEmail", (res)=>{
            setCookie("token", res, 365)
            window.open("/dashboard", "_SELF")
        })

        this.socket.on("registerResponse", (res)=>{
            switch (res.status){
                case "Created":
                    alert("Ok, mas agora verifique seu email!")
                    return
                case "EmailAlreadyUsed":
                    this.setState({emailTriggered: true})
                    alert("Email já usado, que tal fazer login?")
                    return
                case "UsernameAlreadyUsed":
                    this.setState({usernameTriggered: true})
                    alert("Este nome de usuário já existe")
                    return
                default:
                    alert("Erro desconhecido, tente mais tarde!")
            }
        })

        this.setValue = this.setValue.bind(this)
        this.submit = this.submit.bind(this)
    }
    async submit(){
        var username = this.state.username
        var email = this.state.email
        var password = this.state.password
        var ok = true

        if(!regEx.email.test(email)){
            this.setState({emailTriggered: true})
            alert("Email invalido!")
            ok = false
        }
        if(!regEx.username.test(username)){
            this.setState({usernameTriggered: true})
            alert("Nome de usuário invalido (deve ter entre 5 e 20 caracteres alfanuméricos)")
            ok = false
        }
        if(password.length < 5){
            this.setState({passwordTriggered: true})
            alert("Senha invalida(deve ter mais de 5 caracteres)")
            ok = false
        }

        if(ok){
            password = await sha256(password)
            this.socket.emit("register", {username, email, password})
        }
    }
    setValue(ev){
        var obj = {}
        obj[ev.target.id] = ev.target.value
        obj[ev.target.id + "Triggered"] = false
        this.setState(obj)
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
                    <h2>Crie sua conta!</h2>
                    <input
                        style={{borderColor: this.state.usernameTriggered ? "#FA1133" : "#5603AD"}}
                        type="text"
                        id="username"
                        placeholder="Nome de usuário"
                        onKeyUp={this.setValue}
                    /><br/>
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
                    <input
                        type="button"
                        id="btnBack"
                        onClick={()=>window.open("/login", "_SELF")}
                        value="Login"
                    />
                    <input
                        type="button"
                        id="btnSubmit"
                        value="Registrar-se"
                        onClick={this.submit}
                    />
                </form>
            </div>
        )
    }
}