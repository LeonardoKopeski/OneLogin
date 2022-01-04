subpages["home"] = class extends React.Component{
    constructor(props){
        super(props)
    }
    render(){
        return (
        <nav className="homeSubpage">
            <div className="block" data-size="half">
                <h1>{translation["Friends"]}</h1>
                <p>{translation["FriendsSlogan"]}</p>
                <a onClick={()=>this.props.changeScreen("friendList")}>
                    {translation["OpenFriendList"]}
                </a>
            </div>
            <div className="block" data-size="half">
                <h1>{translation["Personalization"]}</h1>
                <p>{translation["PersonalizationSlogan"]}</p>
                <a onClick={()=>this.props.changeScreen("personalization")}>
                    {translation["PersonalizeMyAccount"]}
                </a>
            </div>
            <div className="block" data-size="full">
                <h1>{translation["Security"]}</h1>
                <p>{translation["SecuritySlogan"]}</p>
                <a onClick={()=>alert("wip")}>
                    {translation["OpenSecurityPanel"]}
                </a>
            </div>
        </nav>
        )
    }
}