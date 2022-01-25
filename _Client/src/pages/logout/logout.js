import {Component} from 'react'
import {deleteCookie} from '../../functions/cookies.js'

export default class Logout extends Component{
    constructor(){
        deleteCookie("token")
        localStorage.removeItem("loggedUserInfo")
        window.open("/login", "_SELF")
    }
    render(){
        return(<div></div>)
    }
}