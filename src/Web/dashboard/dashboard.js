var root = document.querySelector("div#root")
var socket = io()
var subpages = {}

const returnSVG = <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="arrow-left" className="returnSVG" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M447.1 256C447.1 273.7 433.7 288 416 288H109.3l105.4 105.4c12.5 12.5 12.5 32.75 0 45.25C208.4 444.9 200.2 448 192 448s-16.38-3.125-22.62-9.375l-160-160c-12.5-12.5-12.5-32.75 0-45.25l160-160c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25L109.3 224H416C433.7 224 447.1 238.3 447.1 256z"></path></svg>

if(getCookie("token") == ""){
    open("/login", "_SELF")
}

class App extends React.Component{
    constructor(){
        super()
    
        this.state = {
            infoRequested: false,
            userInfo: {},
            subpage: "personalization"
        }
        
        socket.on("userInfoResponse", (res)=>{
            if(res.status == "Ok"){
                this.setState({userInfo: {...res}})
            }else{
                open("/logout")
            }
            socket.off("userInfoResponse")
        })
    }
    componentDidMount(){
        if(this.state.infoRequested == false){
            socket.emit("getUserInfo", {token: getCookie("token")})
            this.setState({infoRequested: true})
        }
    }
    render(){
        const userInfo = this.state.userInfo
        const SubPage = subpages[this.state.subpage]

        if(this.state.userInfo.username == undefined){
            return <Spinner/>
        }else{
            return(
            <div className="dashboardScreen">
                <img src={userInfo.imageUrl || alternativePhoto} alt="image"/>
                <h1 id="username">{
                    this.state.subpage == "home" ?
                    "Olá "+userInfo.username+"!" :
                    "@"+userInfo.username
                }</h1>

                <SubPage
                    changeScreen={(screen)=>this.setState({subpage: screen})}
                    forceUpdate={()=>this.forceUpdate()}
                    returnSVG={returnSVG}
                    userInfo={userInfo}
                />
            </div>
            )
        }
    }
}

ReactDOM.render(<App />,root)