var root = document.querySelector("div#root")
var socket = io()
var subpages = {}

const returnSVG = <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="arrow-left" className="returnSVG" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M447.1 256C447.1 273.7 433.7 288 416 288H109.3l105.4 105.4c12.5 12.5 12.5 32.75 0 45.25C208.4 444.9 200.2 448 192 448s-16.38-3.125-22.62-9.375l-160-160c-12.5-12.5-12.5-32.75 0-45.25l160-160c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25L109.3 224H416C433.7 224 447.1 238.3 447.1 256z"></path></svg>
const notificationSVG = <svg aria-hidden="true" focusable="false" data-prefix="far" data-icon="bell" className="notificationSVG" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M256 32V49.88C328.5 61.39 384 124.2 384 200V233.4C384 278.8 399.5 322.9 427.8 358.4L442.7 377C448.5 384.2 449.6 394.1 445.6 402.4C441.6 410.7 433.2 416 424 416H24C14.77 416 6.365 410.7 2.369 402.4C-1.628 394.1-.504 384.2 5.26 377L20.17 358.4C48.54 322.9 64 278.8 64 233.4V200C64 124.2 119.5 61.39 192 49.88V32C192 14.33 206.3 0 224 0C241.7 0 256 14.33 256 32V32zM216 96C158.6 96 112 142.6 112 200V233.4C112 281.3 98.12 328 72.31 368H375.7C349.9 328 336 281.3 336 233.4V200C336 142.6 289.4 96 232 96H216zM288 448C288 464.1 281.3 481.3 269.3 493.3C257.3 505.3 240.1 512 224 512C207 512 190.7 505.3 178.7 493.3C166.7 481.3 160 464.1 160 448H288z"></path></svg>

if(getCookie("token") == ""){
    open("/login", "_SELF")
}

class App extends React.Component{
    constructor(){
        super()
    
        const urlParams = new URLSearchParams(window.location.search)
        const subpage = urlParams.get('subpage')

        this.state = {
            infoRequested: false,
            userInfo: {},
            subpage: subpage || "home"
        }

        this.notificationCount = 0
        
        socket.on("userInfoResponse", (res)=>{
            if(res.status == "Ok"){
                res.notifications.forEach(elm=>{
                    if(!elm.viewed){ this.notificationCount++ }
                })
                this.setState({userInfo: {...res}})
            }else{
                open("/logout", "_SELF")
            }
        })

        this.openNotifications = this.openNotifications.bind(this)
        this.changeScreen = this.changeScreen.bind(this)
    }
    componentDidMount(){
        if(this.state.infoRequested == false){
            socket.emit("getUserInfo", {token: getCookie("token")})
            this.setState({infoRequested: true})
        }
    }
    openNotifications(ev){
        ev.target.classList.remove("alert")
        this.notificationCount = 0

        this.setState({subpage: "notifications"})
    }
    changeScreen(screen){
        this.setState({subpage: screen})
        socket.emit("getUserInfo", {token: getCookie("token")})
    }
    render(){
        const userInfo = this.state.userInfo
        const SubPage = subpages[this.state.subpage]

        if(this.state.userInfo.username == undefined){
            return <Spinner/>
        }else{
            return(
            <div className="dashboardScreen">
                <header>
                    <div id="logo">
                        <h1>OneLogin</h1>
                        <h2>By One Network</h2>
                    </div>
                    <div id="right">
                        <div id="notification" className={this.notificationCount == 0? "": "alert"} onClick={this.openNotifications}>
                            <span id="notificationCount">{this.notificationCount}</span>
                            {notificationSVG}
                        </div>
                    </div>
                </header>
                <img src={userInfo.imageUrl || alternativePhoto} alt="image"/>
                <h1 id="username">{
                    this.state.subpage == "home" ?
                    `${translation["DefaultGreeting"]} ${userInfo.username}!` :
                    `@${userInfo.username}`
                }</h1>

                <SubPage
                    changeScreen={this.changeScreen}
                    forceUpdate={()=>this.forceUpdate()}
                    returnSVG={returnSVG}
                    userInfo={userInfo}
                    socket={socket}
                />
            </div>
            )
        }
    }
}

ReactDOM.render(<App />,root)