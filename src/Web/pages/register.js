class RegisterScreen extends React.Component{
    constructor(props){
        super(props)

        this.props.socket.on("registerResponse", (res)=>{
            if(res.status == "Created"){
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
            var username = document.querySelector("input#username").value
            var email = document.querySelector("input#email").value
            var password = document.querySelector("input#password").value

            this.props.socket.emit("register", {username, email, password})
        }

        return(
            <form className="loginScreen">
                <h1>OneLogin</h1>
                <h2>{translationKey["RegisterSubtitle"]}</h2>
                <input
                    type="text"
                    id="username"
                    placeholder={translationKey["Username"]}
                /><br/>
                <input
                    type="email"
                    id="email"
                    placeholder={translationKey["Email"]}
                /><br/>
                <input
                    type="password"
                    id="password"
                    placeholder={translationKey["Password"]}
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