module.exports = async(api, permission, getApi, account)=>{
    if(typeof api != "string"){
        return {status: "BadRequest", code: 400}
    }
    
    var apis = await getApi({token: api})

    if(!apis[0]){
        return {status: "InvalidApiToken", code: 401}
    }

    if(apis[0].permissions.indexOf(permission) == -1 && permission !== null) {
        return {status: "InsufficientPermissions", code: 403}
    }

    if(apis[0].locked){
        return {status: "TemporarilyLockedApi", code: 403}
    }
    
    if(!apis[0].verified){
        return {status: "UnverifiedApi", code: 403}
    }

    if(account != null){
        var accountServices = account.services[apis[0].token]

        if(accountServices.acceptedPermissions.indexOf(permission) == -1){
            return {status: "NoAcceptedPermissionByUser", code: 403}
        }
    }

    return {status: "Ok", code: 200, data: apis[0]}
}