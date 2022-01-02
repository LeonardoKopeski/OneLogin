subpages["home"] = class extends React.Component{
    constructor(props){
        super(props)
    }
    render(){
        return (
        <nav className="homeSubpage">
            <div className="block" data-size="half">
                <h1>Amizades</h1>
                <p>Você pode adicionar e remover amigos, enviar mensagens diretas, bloquear pessoas, etc...</p>
                <a onClick={()=>this.props.changeScreen("friendList")}>
                    Abrir lista de amigos
                </a>
            </div>
            <div className="block" data-size="half">
                <h1>Personalização</h1>
                <p>Você pode personalizar sua conta editando seu username, foto de perfil, ou até sua cor de destaque</p>
                <a onClick={()=>this.props.changeScreen("personalization")}>
                    Personalizar minha conta
                </a>
            </div>
            <div className="block" data-size="full">
                <h1>Privacidade e Segurança</h1>
                <p>Aqui você vê recomendações de segurança, controla quem pode ver sua conta e bloqueia serviços indesejados</p>
                <a onClick={()=>alert("wip")}>
                    Abrir painel de segurança e privacidade
                </a>
            </div>
        </nav>
        )
    }
}