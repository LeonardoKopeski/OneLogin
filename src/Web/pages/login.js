class LoginScreen extends React.Component{
    constructor(props){
        super(props)

        this.state = {
            emailTriggered: false,
            passwordTriggered: false,
            email: "",
            password: ""
        }

        this.props.socket.on("loginResponse", (res)=>{
            if(res.status == "Ok"){
                setCookie("token", res.token, 365)
                this.props.changeScreen("home")
            }else{
                alert(res.status)
            }
        })
    }
    render(){
        var translationKey = this.props.translationKey

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
                this.props.socket.emit("login", {email, password})
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
                <h2>{translationKey["LoginSubtitle"]}</h2>
                <input
                    style={{borderColor: this.state.emailTriggered ? "#FA1133" : "#5603AD"}}
                    type="email"
                    id="email"
                    placeholder={translationKey["Email"]}
                    onKeyUp={setValue}
                /><br/>
                <input
                    style={{borderColor: this.state.passwordTriggered ? "#FA1133" : "#5603AD"}}
                    type="password"
                    id="password"
                    placeholder={translationKey["Password"]}
                    onKeyUp={setValue}
                /><br/>
                <a>{translationKey["ForgotenPassword"]}</a><br/>
                <input
                    type="button"
                    id="btnBack"
                    onClick={()=>this.props.changeScreen("register")}
                    value={translationKey["Register"]}
                />
                <input
                    type="button"
                    id="btnSubmit"
                    value={translationKey["Login"]}
                    onClick={submit}
                />
            </form>
        )
    }
}