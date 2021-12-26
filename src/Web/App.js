var root = document.querySelector("div#root")
var socket = io()

class App extends React.Component{
    constructor(){
        super()

        this.state = {
            screen: getScreen().path
        }

        var url = "/" + getScreen().path
        var args = getScreen().args
        if(args){url += "/" + args}

        document.title = "OneLogin - "+this.state.screen
        window.history.pushState("", null, url)
    }
    render(){
        var changeScreen = (screen, args) => {
            var url = "/" + screen
            if(args){url += "/" + args}

            document.title = "OneLogin - "+screen
            window.history.pushState("", null, url)
            this.setState({screen})
        }

        switch (this.state.screen) {
            case "home":
                return <HomeScreen
                    changeScreen={changeScreen}
                    translationKey={translation}
                    socket={socket}
                />
            case "login":
                return <LoginScreen
                    changeScreen={changeScreen}
                    translationKey={translation}
                    socket={socket}
                />
            case "register":
                return <RegisterScreen
                    changeScreen={changeScreen}
                    translationKey={translation}
                    socket={socket}
                />
            default:
                return <h1>{this.state.screen}</h1>
        }
    }
}

ReactDOM.render(<App />,root)