var root = document.querySelector("div#root")
var socket = io()

var randomId = Math.floor(Math.random()*spinners.length)

class App extends React.Component{
    constructor(){
        super()

        this.state = {
            infoRequested: false,
            userInfo: {},
            apiInfo: {},
            page: 1
        }
        
        socket.on("userInfoResponse", (res)=>{
            if(res.status == "Ok"){
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
                {translation[elm+"Permission"] || ""}
            </li>
            )
        })
    }
    componentDidMount(){
        if(this.state.infoRequested == false){
            socket.emit("getUserInfo", {token: getCookie("token")})
            socket.emit("getApiInfo", {loginToken: new URLSearchParams(window.location.search).get("loginToken")})
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
                    <h1>{translation["FastLoginSlogan"]}</h1>
                    <img src={userInfo.imageUrl || alternativePhoto} style={{borderColor: userInfo.highlightColor}} alt="image"/>
                    <h1 id="username">
                        @{userInfo.username}
                    </h1>
                    <button onClick={()=>this.setState({page: 2})}>{translation["Next"]}</button>
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
                    <h1>{apiInfo.name} {translation["Can"]}:</h1>
                    <ul id="permissionList">
                        {this.getPermissionList()}
                    </ul>
                    <p id="disclaimer">
                        {translation["FastLoginDisclaimer1"]}
                        <a onClick={()=> open(apiInfo.termsUrl)}>
                            {translation["TermsOfUse"]}
                        </a>
                        {translation["FastLoginDisclaimer2"]}
                        "{apiInfo.name}"
                    </p>
                    <button className="colored" onClick={this.login}>{translation["Login"]}</button>
                </div>
            </div>
            )
        }
    }
}

ReactDOM.render(<App />,root)