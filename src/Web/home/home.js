var root = document.querySelector("div#root")

class App extends React.Component{
    constructor(){
        super()

    }
    render(){
        return(
        <div className="homeScreen">
            <div id="logo">
                <h1>OneLogin</h1>
                <h2>By One Network</h2>
            </div>
        </div>
        )
    }
}

ReactDOM.render(<App />,root)