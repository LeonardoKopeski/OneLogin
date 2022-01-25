import {Component} from 'react'
import {verifiedBadge, returnSVG, alternativePhoto} from "../../../functions/const.js";
import "./style.css"

export default class DashboardFriendList extends Component{
    constructor(){
        super()
        
        var localData = localStorage.getItem("loggedUserInfo")
        try{
            localData = JSON.parse(localData)
        }catch(err){
            alert("No data")
        }

        this.state = {
            userInfo: localData
        }

        this.makeList = this.makeList.bind(this)
    }
    makeList(){
        return this.state.userInfo.friendList.map((elm, index) => {
            return(
            <li key={index}>
                <img src={elm.imageUrl || alternativePhoto} alt="friend"/>
                <h1>@{elm.username}{elm.verified?verifiedBadge:null}</h1>
                <h2>{elm.bio}</h2>
            </li>
            )
        })
    }
    render(){
        return (
        <ul className="friendList">
            <li id="header">
                <div onClick={()=>window.open("/dashboard", "_SELF")}>
                    {returnSVG}
                </div>
                <h2>
                    Amigos
                </h2>
            </li>
            {this.makeList()}
        </ul>
        )
    }
}