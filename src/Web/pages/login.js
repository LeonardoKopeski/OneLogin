class LoginScreen extends React.Component{
    constructor(props){
        super(props)

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
            var email = document.querySelector("input#email").value
            var password = document.querySelector("input#password").value

            this.props.socket.emit("login", {email, password})
        }

        return(
            <form className="loginScreen">
                <h1>OneLogin</h1>
                <h2>{translationKey["LoginSubtitle"]}</h2>
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