var root = document.querySelector("div#root")
var socket = io()

const returnSVG = <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="arrow-left" className="returnSVG" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M447.1 256C447.1 273.7 433.7 288 416 288H109.3l105.4 105.4c12.5 12.5 12.5 32.75 0 45.25C208.4 444.9 200.2 448 192 448s-16.38-3.125-22.62-9.375l-160-160c-12.5-12.5-12.5-32.75 0-45.25l160-160c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25L109.3 224H416C433.7 224 447.1 238.3 447.1 256z"></path></svg>

class App extends React.Component{
    constructor(){
        super()

        this.state = {
            infoRequested: false,
            userInfo: {},
        }
        
        socket.on("basicInfoResponse", (res)=>{
            if(res.status == "Ok"){
                this.setState({userInfo: {...res}})
            }else{
                open("/notFound", "_SELF")
            }
        })
    }
    componentDidMount(){
        if(this.state.infoRequested == false){
            const urlParams = new URLSearchParams(window.location.search)
            const username = urlParams.get('user')
            socket.emit("getBasicInfo", {username})
            this.setState({infoRequested: true})
        }
    }
    render(){
        const userInfo = this.state.userInfo

        if(this.state.userInfo.username == undefined){
            return <Spinner/>
        }else{
            return(
            <div className="accountScreen">
                <header>
                    <div id="logo">
                        <h1>OneLogin</h1>
                        <h2>By One Network</h2>
                    </div>
                </header>
                <img src={userInfo.imageUrl || alternativePhoto} alt="image"/>
                <h1 id="username">{
                    this.state.subpage == "home" ?
                    `${translation["DefaultGreeting"]} ${userInfo.username}!` :
                    `@${userInfo.username}`
                }</h1>
                <p id="bio">
                    "{userInfo.bio}"
                </p>
            </div>
            )
        }
    }
}

ReactDOM.render(<App />,root)