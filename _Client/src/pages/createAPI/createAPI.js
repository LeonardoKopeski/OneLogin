import {Component} from 'react'
import io from "socket.io-client"
import regEx from '../../functions/regex.js'
import { sha256 } from '../../functions/encryption.js'
import { getCookie } from '../../functions/cookies.js'
import "./style.css" 

export default class createAPI extends Component{
    constructor(){
        super()

        this.socket = io("http://localhost:4000")

        this.state = {
            nameTriggered: false,
            passwordTriggered: false,
            name: "",
            password: ""
        }

        this.socket.on("createAPIResponse", (res)=>{
            if(res.status === "Created" || res.status === "AccountAlreadyUsed"){
                window.open("/dashboard/api", "_SELF")
            }else if(res.status === "NameAlreadyUsed"){
                alert("Já existe uma API com esse nome!")
            }else{
                alert("Senha invalida!")
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
        var name = this.state.name
        var password = this.state.password
        var ok = true

        if(!regEx.username.test(name)){
            this.setState({nameTriggered: true})
            ok = false
        }
        if(password.length < 5){
            this.setState({passwordTriggered: true})
            ok = false
        }

        if(ok){
            password = await sha256(password)
            this.socket.emit("createAPI", {name, password, token: getCookie("token")})
        }
    }
    render(){
        return(
            <div className="createAPIScreen">
                <header>
                    <div id="logo" onClick={()=>window.open("/","_SELF")}>
                        <h1>OneLogin</h1>
                        <h2>By Leonardo Kopeski</h2>
                    </div>
                </header>
                <form>
                    <h1>OneLogin</h1>
                    <h2>Crie sua conta de desenvolvedor!</h2>
                    <input
                        style={{borderColor: this.state.nameTriggered ? "#FA1133" : "#5603AD"}}
                        type="text"
                        id="name"
                        placeholder="Nome do serviço"
                        onKeyUp={this.setValue}
                    /><br/>
                    <input
                        style={{borderColor: this.state.passwordTriggered ? "#FA1133" : "#5603AD"}}
                        type="password"
                        id="password"
                        placeholder="Confirme sua senha"
                        onKeyUp={this.setValue}
                    /><br/>
                    <input
                        type="button"
                        id="btnBack"
                        onClick={()=>window.open("/dashboard", "_SELF")}
                        value="Voltar"
                    />
                    <input
                        type="button"
                        id="btnSubmit"
                        value="Criar"
                        onClick={this.submit}
                    />
                </form>
            </div>
        )
    }
}