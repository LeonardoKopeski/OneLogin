var root = document.querySelector("div#root")
var socket = io()
var subpages = {}

const returnSVG = <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="arrow-left" className="returnSVG" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M447.1 256C447.1 273.7 433.7 288 416 288H109.3l105.4 105.4c12.5 12.5 12.5 32.75 0 45.25C208.4 444.9 200.2 448 192 448s-16.38-3.125-22.62-9.375l-160-160c-12.5-12.5-12.5-32.75 0-45.25l160-160c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25L109.3 224H416C433.7 224 447.1 238.3 447.1 256z"></path></svg>

if(getCookie("apiToken") == ""){
    open("/api/login", "_SELF")
}

class App extends React.Component{
    constructor(){
        super()
    
        const urlParams = new URLSearchParams(window.location.search)
        const subpage = urlParams.get('subpage')

        this.state = {
            infoRequested: false,
            apiInfo: {},
            subpage: subpage || "home"
        }
        
        socket.on("apiInfoResponse", (res)=>{
            if(res.status == "Ok"){
                this.setState({apiInfo: {...res}})
            }else{
                open("/api/logout", "_SELF")
            }
        })

        this.changeScreen = this.changeScreen.bind(this)
    }
    componentDidMount(){
        if(this.state.infoRequested == false){
            socket.emit("getApiInfo", {apiToken: getCookie("apiToken")})
            this.setState({infoRequested: true})
        }
    }
    changeScreen(screen){
        this.setState({subpage: screen})
        socket.emit("getApiInfo", {apiToken: getCookie("apiToken")})
    }
    render(){
        const apiInfo = this.state.apiInfo
        const SubPage = subpages[this.state.subpage]

        if(apiInfo.name == undefined){
            return <Spinner/>
        }else{
            return(
            <div className="dashboardScreen">
                <header>
                    <div id="logo" onClick={()=>open("/","_SELF")}>
                        <h1>OneLogin <span className="apiTag">API</span></h1>
                        <h2>By Leonardo Kopeski</h2>
                    </div>
                </header>
                <div id="img">{"{API}"}</div>
                <h1 id="username">#{apiInfo.name}</h1>

                <SubPage
                    changeScreen={this.changeScreen}
                    forceUpdate={()=>this.forceUpdate()}
                    returnSVG={returnSVG}
                    apiInfo={apiInfo}
                    socket={socket}
                />
            </div>
            )
        }
    }
}

ReactDOM.render(<App />,root)