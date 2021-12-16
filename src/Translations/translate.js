async function translate(){
    var res = await fetch("/translationApi/translationKey")
    var translationKeys = await res.json()

    document.querySelectorAll("*").forEach(elm => {
        if(isTranslateKey(elm.innerText)){
            elm.innerText = translationKeys[elm.innerText]
        }else if(isTranslateKey(elm.placeholder)){
            elm.placeholder = translationKeys[elm.placeholder]
        }else if(isTranslateKey(elm.value)){
            elm.value = translationKeys[elm.value]
        }
    })
}

function isTranslateKey(str){
    if(str == null){
        return false
    }
    var appears = str.split("%").length - 1
    var firstChar = str.split("")[0]
    var lastChar = str.split("")[str.length-1] 

    return appears == 2 && firstChar == "%" && lastChar == "%"
}

translate()