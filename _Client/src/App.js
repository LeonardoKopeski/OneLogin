import { Routes, Route, Link } from "react-router-dom";

function App(){
    return (
        <div className="App">
        <h1>Welcome to React Router!</h1>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
        </Routes>
        </div>
    )
}

function Home(){
    return (
    <div>
        hello world, home!
        <Link to="/about">Go to about page...</Link>
    </div>
    )
}

function About(){
    return (
    <div>
        There's not to say about me...
        <Link to="/">Go back to the homepage...</Link>    
    </div>
    )
}

export default App