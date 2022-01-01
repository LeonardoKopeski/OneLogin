class Modal extends React.Component{
    constructor(){
        super()

        
    }
    render(){
        var buttons = this.props.buttons || {ok: {}, cancel: {}, close: {}}
        if(buttons.close == undefined || buttons.ok == undefined || buttons.cancel == undefined){
            buttons = {ok: {}, cancel: {}, close: {}}
        }

        return (
        <div className="modal" style={{display: this.props.display?"block":"none"}}>
            <div id="box">
                <h1>{this.props.title || ""}</h1>
                <button
                    style={{display: buttons.close.display == true || buttons.close.display == undefined?"block":"none"}}
                    onClick={buttons.close.action}
                    id="close"
                >X</button>

                {this.props.body}

                <button
                    style={{display: buttons.cancel.display == true || buttons.cancel.display == undefined?"inline-block":"none"}}
                    onClick={buttons.cancel.action}
                    className="navButton"
                >{buttons.cancel.text || "Cancel"}</button>

                <button
                    style={{display: buttons.cancel.display == true || buttons.ok.display == undefined?"inline-block":"none"}} 
                    onClick={buttons.ok.action}
                    className="navButton colorized"
                >{buttons.ok.text || "Ok"}</button>
            </div>
        </div>
        )
    }
}