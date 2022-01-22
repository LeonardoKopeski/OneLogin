var root = document.querySelector("div#root")
var socket = io()

var randomId = Math.floor(Math.random()*spinners.length)

const permissions = {
    "GetBasicData": "Ver seus dados basicos (nome de usuário, foto, biografia, etc...)",
    "GetFriendList": "Ver sua lista de amigos"
}

class App extends React.Component{
    constructor(){
        super()

        var localData = localStorage.getItem("loggedUserInfo")
        try{
            localData = JSON.parse(localData)
        }catch(err){
            localData = undefined
        }

        this.state = {
            infoRequested: false,
            userInfo: localData || {},
            apiInfo: {},
            page: 1
        }
        
        socket.on("userInfoResponse", (res)=>{
            if(res.status == "Ok"){
                localStorage.setItem("loggedUserInfo", JSON.stringify(res))
                this.setState({userInfo: {...res}})
            }else{
                open("/login?returnTo=" + location.pathname + location.search, "_SELF")
            }
        })

        socket.on("apiInfoResponse", (res)=>{
            if(res.status == "Ok"){
                this.setState({apiInfo: {...res}})
            }else{
                alert("Invalid LoginRequest, returning...")
                open(document.referrer || "/", "_SELF")
            }
        })

        socket.on("loginResponse", (res)=>{
            if(res.status == "Ok"){
                postData(res.returnTo, {token: res.token})
            }else{
                alert("Invalid LoginRequest, returning...")
                open(document.referrer || "/", "_SELF")
            }
        })

        this.login = this.login.bind(this)
        this.getPermissionList = this.getPermissionList.bind(this)
    }
    login(){
        const urlParams = new URLSearchParams(window.location.search)
        const loginToken = urlParams.get('loginToken')
        socket.emit("fastLogin", {token: getCookie("token"), loginToken: loginToken})
    }
    getPermissionList(){
        const warnPermissions = []
        return this.state.apiInfo.permissions.map(elm => {
            return(
            <li className={warnPermissions.indexOf(elm) != -1? "warn": ""} key={elm}>
                {permissions[elm] || ""}
            </li>
            )
        })
    }
    componentDidMount(){
        if(this.state.infoRequested == false){
            socket.emit("getUserInfo", {token: getCookie("token")})
            socket.emit("getLoginApiInfo", {loginToken: new URLSearchParams(window.location.search).get("loginToken")})
            this.setState({infoRequested: true})
        }
    }
    render(){
        const userInfo = this.state.userInfo
        const apiInfo = this.state.apiInfo
        
        if(userInfo.username == undefined || apiInfo.name == undefined){
            return <Spinner randomId={randomId}/>
        }else if(this.state.page == 1){
            return(
            <div className="fastLoginScreen">
                <header>
                    <div id="logo" onClick={()=>open("/","_SELF")}>
                        <h1>OneLogin</h1>
                        <h2>By Leonardo Kopeski</h2>
                    </div>
                </header>
                <div id="account">
                    <h1>Entrar rapimente com OneLogin</h1>
                    <img src={userInfo.imageUrl || alternativePhoto} style={{borderColor: userInfo.highlightColor}} alt="image"/>
                    <h1 id="username">
                        @{userInfo.username}
                    </h1>
                    <button onClick={()=>this.setState({page: 2})}>Proximo</button>
                </div>
            </div>
            )
        }else{
            return(
                <div className="fastLoginScreen">
                <header>
                    <div id="logo" onClick={()=>open("/","_SELF")}>
                        <h1>OneLogin</h1>
                        <h2>By Leonardo Kopeski</h2>
                    </div>
                </header>
                <div id="account">
                    <h1>{apiInfo.name} poderá:</h1>
                    <ul id="permissionList">
                        {this.getPermissionList()}
                    </ul>
                    <p id="disclaimer">
                        Ao prosseguir, você aceita todos os&nbsp;
                        <a onClick={()=> open(apiInfo.termsUrl)}>
                            termos de uso
                        </a>
                        &nbsp;de "{apiInfo.name}"
                    </p>
                    <button className="colored" onClick={this.login}>Login</button>
                </div>
            </div>
            )
        }
    }
}

ReactDOM.render(<App />,root)