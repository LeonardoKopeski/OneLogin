import {Component} from 'react'
import io from "socket.io-client"
import regEx from '../../functions/regex.js'
import "./style.css"


export default class ForgotPassword extends Component{
    constructor(){
        super()

        this.socket = io("http://localhost:4000")

        this.state = {
            emailTriggered: false,
            email: "",
            page: 1
        }

        this.setValue = this.setValue.bind(this)
        this.submit = this.submit.bind(this)
    }
    setValue(ev){
        this.setState({email: ev.target.value, emailTriggered: false})
    }
    async submit(){
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
            {this.state.page ===  1?
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
            :
                <div id="account">
                    <h1>OneLogin</h1>
                    <h2>Esqueci minha senha...</h2>
                    <p id="disclaimer">
                        Caso sua conta exista, você receberá um email com um link, para redefinir sua senha!
                    </p>
                    <button onClick={this.submit}>Enviar novamente...</button>
                </div>
            }
        </div>
        )
    }
}