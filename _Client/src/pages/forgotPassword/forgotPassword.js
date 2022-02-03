import {Component} from 'react'
import io from "socket.io-client"
import regEx from '../../functions/regex.js'
import { sha256 } from '../../functions/encryption.js'
import "./style.css"


export default class ForgotPassword extends Component{
    constructor(){
        super()

        this.socket = io("http://localhost:4000")

        this.state = {
            emailTriggered: false,
            email: "",
            passwordTriggered: false,
            password: "",
            resetToken: "",
            page: 1
        }

        this.socket.on("forgotPasswordVerified", (resetToken)=>{
            this.setState({page: 3, resetToken: resetToken})
        })

        this.setValue = this.setValue.bind(this)
        this.submit = this.submit.bind(this)
        this.finish = this.finish.bind(this)
        this.showPage = this.showPage.bind(this)
    }
    showPage(){
        switch (this.state.page) {
            case 1:
                return(
                <div id="account">
                    <h1>OneLogin</h1>
                    <h2>Esqueci minha senha...</h2>
                    <input
                        style={{borderColor: this.state.emailTriggered ? "#FA1133" : "#5603AD"}}
                        type="email"
                        id="email"
                        placeholder="Digite seu email!"
                        onKeyUp={this.setValue}
                    /><br/>
                    <button onClick={this.submit}>Redefinir senha!</button>
                </div>
                )
            case 2:
                return(
                <div id="account">
                    <h1>OneLogin</h1>
                    <h2>Esqueci minha senha...</h2>
                    <p id="disclaimer">
                        Caso sua conta exista, você receberá um email com um link, para redefinir sua senha!
                        <br/>
                        <br/>
                        Ao verificar seu email, você será redirecionado, portanto, NÃO SAIA DESSA PAGINA!
                    </p>
                    <button onClick={this.submit}>Enviar novamente...</button>
                </div>
                )
            case 3:
                return(
                    <div id="account">
                        <h1>OneLogin</h1>
                        <h2>Esqueci minha senha...</h2>
                        <input
                            style={{borderColor: this.state.passwordTriggered ? "#FA1133" : "#5603AD"}}
                            type="password"
                            id="password"
                            placeholder="Digite sua senha nova!"
                            onKeyUp={this.setValue}
                        /><br/>
                        <button onClick={this.finish}>Concluir!</button>
                    </div>
                    )
            default:
                break;
        }
    }
    setValue(ev){
        var obj = {}
        obj[ev.target.id] = ev.target.value
        obj[ev.target.id + "Triggered"] = false
        this.setState(obj)
    }
    async finish(){
        var password = this.state.password

        if(password.length < 5){
            this.setState({passwordTriggered: true})
        }else{
            password = await sha256(password)
            this.socket.emit("updateForgotPassword", {resetToken: this.state.resetToken, password})
            window.open("/login", "_SELF")
        }
    }
    submit(){
        var email = this.state.email

        if(!regEx.email.test(email) || email === ""){
            this.setState({emailTriggered: true})
        }else{
            this.socket.emit("forgotPassword", {email})
            this.setState({page: 2})
        }
    }
    render(){
        return(
        <div className="forgotPasswordScreen">
            <header>
                <div id="logo" onClick={()=>window.open("/","_SELF")}>
                    <h1>OneLogin</h1>
                    <h2>By Leonardo Kopeski</h2>
                </div>
            </header>
            {this.showPage()}
        </div>
        )
    }
}