export function postData(url, obj){
    var form = document.createElement("form")
    form.name = "PostDataForm"
    form.method = "POST"
    form.action = url
    Object.keys(obj).forEach(key=>{
        var input = document.createElement("input")
        input.name = key
        input.value = obj[key]
        input.type = "hidden"
        form.appendChild(input)
    })
    document.body.appendChild(form)
    form.submit()
}

export function copy(text){
    // DevNote: ExecCommand is deprecated, but works on unsecure sites...
    var content = document.createElement('textarea')
    document.body.appendChild(content)
    content.value = text
    content.select()
    document.execCommand('copy')
    document.body.removeChild(content)
}