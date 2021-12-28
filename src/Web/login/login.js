var root = document.querySelector("div#root")
var socket = io()

class App extends React.Component{
    constructor(){
        super()

        this.state = {
            emailTriggered: false,
            passwordTriggered: false,
            email: "",
            password: ""
        }

        this.setScreen = (screen) => {
            if(screen == "myAccount"){
                screen = "account?user="+this.state.userInfo.username
            }
            open("/"+screen, "_SELF")
        }

        socket.on("loginResponse", (res)=>{
            if(res.status == "Ok"){
                setCookie("token", res.token, 365)
                this.setScreen("home")
            }else{
                alert(res.status)
            }
        })
    }
    render(){
        var submit = ()=>{
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
                socket.emit("login", {email, password})
            }
        }

        var setValue = (ev) => {
            var obj = {}
            obj[ev.target.id] = ev.target.value
            obj[ev.target.id + "Triggered"] = false
            this.setState(obj)
        }

        return(
            <form className="loginScreen">
                <h1>OneLogin</h1>
                <h2>{translation["LoginSubtitle"]}</h2>
                <input
                    style={{borderColor: this.state.emailTriggered ? "#FA1133" : "#5603AD"}}
                    type="email"
                    id="email"
                    placeholder={translation["Email"]}
                    onKeyUp={setValue}
                /><br/>
                <input
                    style={{borderColor: this.state.passwordTriggered ? "#FA1133" : "#5603AD"}}
                    type="password"
                    id="password"
                    placeholder={translation["Password"]}
                    onKeyUp={setValue}
                /><br/>
                <a>{translation["ForgotenPassword"]}</a><br/>
                <input
                    type="button"
                    id="btnBack"
                    onClick={()=>this.setScreen("register")}
                    value={translation["Register"]}
                />
                <input
                    type="button"
                    id="btnSubmit"
                    value={translation["Login"]}
                    onClick={submit}
                />
            </form>
        )
    }
}

ReactDOM.render(<App />,root)