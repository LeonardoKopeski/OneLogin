var root = document.querySelector("div#root")

class App extends React.Component{
    render(){
        return (
        <div className="notFoundScreen">
            <header>
                <div id="logo">
                    <h1>OneLogin</h1>
                    <h2>By One Network</h2>
                </div>
            </header>
            <div id="title">
                <h1>:(</h1>
                <h2>{translation["NotFoundSlogan"]}</h2>
            </div>
        </div>
        )
    }
}

ReactDOM.render(<App />,root)