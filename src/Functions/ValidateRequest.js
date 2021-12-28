module.exports = (res, expected)=>{
    if(res == null){return false}

    var ok = true
    if(typeof res != "object"){ok = false}

    Object.keys(expected).forEach(key => {
        if(res[key] == null){ok = false}
        if(typeof expected[key] == "string"){
            if(typeof res[key] != expected[key]){ok = false}
        }else{
            if(!expected[key].test(res[key])){ok = false}
        }
        
    })
    
    return ok
}