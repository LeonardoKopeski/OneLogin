var root = document.querySelector("div#root")
var socket = io()

const editBadge = (<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="pen-to-square" className="edit" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M383.1 448H63.1V128h156.1l64-64H63.1C28.65 64 0 92.65 0 128v320c0 35.35 28.65 64 63.1 64h319.1c35.34 0 63.1-28.65 63.1-64l-.0039-220.1l-63.1 63.99V448zM497.9 42.19l-28.13-28.14c-18.75-18.75-49.14-18.75-67.88 0l-38.62 38.63l96.01 96.01l38.62-38.63C516.7 91.33 516.7 60.94 497.9 42.19zM147.3 274.4l-19.04 95.22c-1.678 8.396 5.725 15.8 14.12 14.12l95.23-19.04c4.646-.9297 8.912-3.213 12.26-6.562l186.8-186.8l-96.01-96.01L153.8 262.2C150.5 265.5 148.2 269.8 147.3 274.4z"></path></svg>)

class App extends React.Component{
    constructor(){
        super()

        this.state = {
            logged: false,
            infoRequested: false,
            userInfo: {}
        }

        socket.on("userInfoResponse", (res)=>{
            if(res.status == "Ok"){
                this.setState({logged: true, userInfo: {...res}})
            }else{
                this.setState({logged: false})
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
        const logged = getCookie("token") != ""
        const userInfo = this.state.userInfo

        var onFileChange = ()=>{
            var input = document.querySelector("input#ImageReader")

            reduceFileSize(input.files[0], 500*1024, 750, 750, 3, async blob => {
                var base64 = await getBase64(blob)
                socket.emit("updateUserInfo", {token: getCookie("token"), imageUrl: base64})

                var old = this.state.userInfo
                old.imageUrl = base64
                this.setState({userInfo: old})
            })
        }

        var changeBio = ()=>{
            var newBio = prompt()
            if(newBio){
                socket.emit("updateUserInfo", {token: getCookie("token"), bio: newBio})

                var old = this.state.userInfo
                old.bio = newBio
                this.setState({userInfo: old})
            }
        }

        if(!logged){
            open("/login", "_SELF")
        }

        if(this.state.userInfo.username == undefined){
            return <Spinner/>
        }else{
            return (
            <div className="editProfileScreen">
                <img src={userInfo.imageUrl || alternativePhoto} alt="image"/>
                <label htmlFor="ImageReader" id="imgMouseOver">{editBadge}</label>

                <h1 id="username">@{userInfo.username}{editBadge}</h1>
                <p id="bio" onClick={changeBio}>"{userInfo.bio}"{editBadge}</p>

                <input type="file" onChange={onFileChange} style={{display: "none"}} id="ImageReader" accept="image/*"/>
            </div>
            )
        }
    }
}

ReactDOM.render(<App />,root)