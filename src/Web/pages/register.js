class RegisterScreen extends React.Component{
    constructor(props){
        super(props)

        this.state = {
            usernameTriggered: false,
            emailTriggered: false,
            passwordTriggered: false,
            username: "",
            email: "",
            password: ""
        }

        this.props.socket.on("registerResponse", (res)=>{
            switch (res.status){
                case "Created":
                    console.log(res)
                    setCookie("token", res.token, 365)
                    this.props.changeScreen("home")
                    return
                case "EmailAlreadyUsed":
                    this.setState({emailTriggered: true})
                    alert("Email Already Used!")
                    return
                case "UsernameAlreadyUsed":
                    this.setState({usernameTriggered: true})
                    alert("Username Already Used!")
                    return
                default:
                    alert(res.status)
            }
        })
    }
    render(){
        var translationKey = this.props.translationKey

        var submit = ()=>{
            var username = this.state.username
            var email = this.state.email
            var password = this.state.password
            var ok = true

            if(!regEx.email.test(email)){
                this.setState({emailTriggered: true})
                ok = false
            }
            if(!regEx.username.test(username)){
                this.setState({usernameTriggered: true})
                ok = false
            }
            if(password.length < 5){
                this.setState({passwordTriggered: true})
                ok = false
            }

            if(ok){
                this.props.socket.emit("register", {username, email, password})
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
                <h2>{translationKey["RegisterSubtitle"]}</h2>
                <input
                    style={{borderColor: this.state.usernameTriggered ? "#FA1133" : "#5603AD"}}
                    type="text"
                    id="username"
                    placeholder={translationKey["Username"]}
                    onKeyUp={setValue}
                /><br/>
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
                    onClick={()=>this.props.changeScreen("login")}
                    value={translationKey["Login"]}
                />
                <input
                    type="button"
                    id="btnSubmit"
                    value={translationKey["Register"]}
                    onClick={submit}
                />
            </form>
        )
    }
}