const DEVELOPMENT_MODE = {
    log: (hasError, message, css) => hasError && console.log(`%c::DEV_MODE\n${message}`,'color:blue', css),
    throw:(approve, message) => {if(!approve) throw message},
    WARNING:'color:black;text-shadow:.5px .5px yellow;font-size:13px',
    ERROR:'color:red'
}

class JMount{
    constructor(data = {}){
        overJson(data, this)
    }
    
    mount_(){
        [
            '_init',
            '_appends',
            '_limits',
            '_events',
            '_requests',
            
        ].forEach(mountMethod => this[mountMethod]?.())
    }
}

class JView extends JMount{

    constructor(jsonEntity, includeThisKeys, ... sourceIds) {
        super()
        jsonEntity = jsonEntity || {}
        this._sourceKeys = keysOf(jsonEntity)
        this._prefix = this.constructor.name + '_'
        this._isTagMount = true
        this._updated = true
        this._sourceIds = sourceIds.flat(Infinity)
        if(includeThisKeys == 0 || includeThisKeys) this.addSourceKeys_(includeThisKeys)
        this.keyChain_(jsonEntity)
        this.aMode_()
    }

    aMode_ = () => A_MODE_SOURCE = this
    
    addSourceKeys_ = (... keys) => {
        this._sourceKeys = this._sourceKeys.concat(keys.flat(Infinity))
        return this.osk_()
    }
    
    ask_ = this.addSourceKeys_

    overSourceKeys_ = (... keys) => {
        keys = keys.flat(Infinity)
        return overJson(this, {}, keys.length? keys : this._sourceKeys)
    }

    osk_ = this.overSourceKeys_

    overSourceKeysPlus_ = (... keys) => {
        keys = this._sourceKeys.concat(keys.flat(Infinity))
        return this.osk_(keys)
    }
    
    psk_ = this.overSourceKeysPlus_

    innerAnchor_ = (elementAnchor, elementName) => {
        this[elementName].id = this._prefix + elementName + ID_MAKER.next().value
        elementAnchor.href = '#' + this[elementName].id
    };
    
    defClasses_ = (... classes) => classes.flat(Infinity)
        .reduce((list, cls) => list.concat(this._prefix + (/^\$/.test(cls) ? cls.substring(1) : cls)), [])
    
    insertClasses_ = (element, ... classes) => addClasses(element, this.defClasses_(classes))
    
    removeClasses_ = (element, ... classes) => removeClasses(element, this.defClasses_(classes))
    
    viewValues_ = (fromUpdate, ... addVarKeys) => {
        let regInput = /^\$input(.)(.*)/,
            regUpdate = /^\$inputUpdate(.)(.*)/,
            index = fromUpdate? 12 : 6,
            strike = addVarKeys.flat(Infinity).reduce((json, key) => {json[key] = this[key]; return json}, {}),
            source = keysOf(this).reduce((json, key) => {   
                if(fromUpdate? regUpdate.test(key) : regInput.test(key) && !regUpdate.test(key)){
                    let value = this[key].value,
                        varKey = key[index].toLowerCase() + key.substring(index+1),
                        inType = this[key].type;

                    let inValues = {
                        'number': +value,
                        'checkbox': this[key].checked
                    };
                    json[varKey] = inType in inValues? inValues[inType] : value
                    if(json[varKey] !== this[varKey]) this._updated = false
                }
                return json
            }, {});
    
        this._sourceKeys.filter(key => /^id/.test(key) && new RegExp(key.replace('id',''), 'i').test(this._prefix))
            .forEach(relativeId => source[relativeId] = this[relativeId])
        this._sourceIds.forEach(id => source[id] = this[id])
        return {...strike, ...source}
    }
    
    isUpdated_ = () => this._updated
    
    updateView_ = (updatedSource, isUpdated = true) => {
        keysOf(updatedSource || this.viewValues_(true)).forEach(varName => this[varName] = updatedSource[varName])
        this._updated = isUpdated
    }

    keyChain_(jsonEntity){
        if (jsonEntity) {
            let entityKeys = keysOf(jsonEntity);
            if(jsonEntity._isTagMount){
                DEVELOPMENT_MODE.log(true, `Received tagMount in jsonEntity, it probably will provoke inconsistences for override attributes of ${this.constructor.name}. You can call osk_() instead pass the view`)
                let thisKeys = keysOf(this);
                entityKeys.filter(key => !thisKeys.includes(key)).forEach(key => {
                    let val = jsonEntity[key],
                        add = !val?.isTagChild;  
                    if(add) this[key] = val
                })
            }else{
                overJson(jsonEntity, this)
            }
            this._sourceKeys = this._sourceKeys.concat(entityKeys)
        }
    }

    append_(element){
        A_MODE_SOURCE = this
        if(!this.$view) A.div('view');
        this.$view.a(element)
        return this
    } 

    disapend_(... elements){
        elements.length? removeElements(this, elements) : disapend(this)
        return this
    }

    identifyContainerHints_(){
        if(!this.containersForHints) this.containersForHints = [];
        keysOf(this).forEach(key => {
            if(/containerHints/.test(key)){
                let container = this[key],
                    identifier = key.split('containerHints')[1];
                container.hintIdentifier = identifier[0].toLowerCase() + identifier.substring(1,)
                container.c('containerHints')
                this.containersForHints.push(container)
            }
        })
    }

}

class ViewInitialize extends JView{
    
    static MENU = 'menu'
    static NAVIGATION = 'navigation'
    static CONTENT = 'content'
    static FOOTER = 'footer'

    constructor(... notIncludeDivs){
        super({notIncludeDivs: notIncludeDivs.flat(Infinity)}).mount_()
    }

    _init(){
        A.div()
        let elementOptions = ['menu', 'navigation', 'content', 'footer'];
        elementOptions.filter(eOption => !this.notIncludeDivs.includes(eOption))
            .forEach(eOption => this.$view.a(A.div(eOption)))

        return this;
    }

    setViewMenu(viewMenu){
        this._setObjectView(viewMenu, ViewInitialize.MENU)
    }

    setViewNavigation(viewNavigation){
        this._setObjectView(viewNavigation, ViewInitialize.NAVIGATION)
    }

    setViewContent(viewContent){
        this._setObjectView(viewContent, ViewInitialize.CONTENT)
    }

    setViewFooter(viewFooter){
        this._setObjectView(viewFooter, ViewInitialize.FOOTER)
    }

    getViewMenu(){return this.viewMenu}

    getViewNavigation(){ return this.viewNavigation}

    getViewContent(){ return this.viewContent}

    getViewFooter(){return this.viewFooter}

    clearDivMenu(){ removeChildren(this.$menu)}

    clearDivNavigation(){ removeChildren(this.$navigation)}

    clearDivContent(){ removeChildren(this.$content)}

    clearDivFooter() {removeChildren(this.$footer)}

    disapendDivMenu(){disapend(this.$menu)}

    disapendDivNavigation(){disapend(this.$navigation)}

    disapendDivContent(){disapend(this.$content)}

    disapendDivFooter(){disapend(this.$footer)}


    _setObjectView(view, elementName){
        let element = this['$'+elementName];
        removeChildren(element)
        element.a(view)
        this['view'+elementName[0].toUpperCase()+elementName.substring(1)] = view
    }
}

class Enderessable{
    constructor(enderesableSource){
        this.apiBase = enderesableSource.apiBase
        this.urlDest = encodeURI(enderesableSource.urlDest || enderesableSource)
        this.onconnectionerror = this.apiBase?.onconnectionerror
    }

    isAPIBase(){
        return !!this.apiBase
    }
}

class APIBase{
    static AUTH_PREFIX = 'Bearer '
    static AUTH_TOKEN_PATH = ['token']

    constructor(urlBase){
        this.urlBase = urlBase.replace(/([^\/])\/+$/, '$1')
    }

    onconnectionerror(){alert('Connection error...')}

    getToken = _ => this.getInfo('token')
    setToken = token => this.setInfo('token', token)
    removeToken = _ => this.removeInfo('token')

    getUser = _ => JSON.parse(this.getInfo('user'))
    setUser = user => this.setInfo('user', JSON.stringify(user))
    removeUser = _ => {
        let codLang = localStorage.getItem('cod_lang');
        localStorage.clear()
        codLang && localStorage.setItem('cod_lang', codLang)
    }

    toResource(resource, fragment){
        if(resource && typeof resource != 'string') throw `type of argument resource is inválid: ${resource}`
        resource = APIBase.complementURL(resource)
        if(fragment && typeof fragment == 'object'){
            let subPath = APIBase.complementURL(fragment.subPath);
            fragment = {...fragment}
            delete fragment.subPath
            fragment = Object.keys(fragment).map((key)=> `${key}=${fragment[key]}`).join('&')
            fragment = subPath+(fragment.length? '?':'') + fragment
        }else{
            fragment = APIBase.complementURL(fragment)
        }
        let urlDest = this.urlBase + resource + fragment;
        return new Enderessable({apiBase:this, urlDest})
    }

    toUrlBase = (fragment) => this.toResource('', fragment)

    static complementURL(urlFragment){
        urlFragment = urlFragment ?? ''
        return (/^\w/.test(urlFragment)? '/':'') + urlFragment
    }

}
 
class JRequest{

    constructor(enderessable, data = {}, contentType = 'application/json;charset=utf-8'){
        this.setEnderessable(enderessable)
        this.data = data
        this.headers = []
        this.contentType = contentType
    }

    static prepare(enderessable, data = {}, contentType = 'application/json;charset=utf-8'){ 
        return new JRequest(enderessable, data, contentType)
    }

    static prepareFiles(enderessable, formData){ 
        return new JRequest(enderessable, formData, null)
    }

    send(method = 'GET'){
        DEVELOPMENT_MODE?.log?.(!('onsuccess' in this), 'onsuccess not declared in request: '+this.url, DEVELOPMENT_MODE.WARNING)
        this._sendAjax(method)
        return this  
    }

    post = _ => this.send('POST')
    get = _ => this.send('GET')
    put = _ => this.send('PUT')
    delete = _ => this.send('DELETE')
    
    addHeaders(...headers){
        let newHeaders = headers.flat(Infinity).map(header => {
            if(header.name) return header
            return {name:header, value:''}
        });
        
        this.headers = headers.filter(header => !(header.name in newHeaders)).concat(newHeaders)
        return this
    }

    setEnderessable = enderessable => {
        this.enderessable = new Enderessable(enderessable)
        this.onconnectionerror = enderessable.onconnectionerror
        return this
    }

    setOnConnectionError(onConnectionError){
        this.onconnectionerror = onConnectionError
        return this
    }

    inSequence(onbefore, onready, onsuccess, onerror, onafter){
        this.onbefore = onbefore
        this.onready = onready
        return this.inResponse(onsuccess, onerror, onafter)
    }

    inResponse(onsuccess, onerror, onafter){
        this.onsuccess = onsuccess
        this.onerror = onerror
        this.onafter = onafter
        return this;
    }
    
    _onreadystatechange = ajaxEvent => {
        let response = this._ajaxResponse(ajaxEvent);

        if(response){
            let {success, hasError, details, codeType} = response;
            if(codeType == 0) this.onconnectionerror?.(response)

            this.onready?.(details, response, ajaxEvent)
            if(success) this.onsuccess?.(details, response, ajaxEvent)
            if(hasError) this.onerror?.(details, response, ajaxEvent)
            this.onafter?.(details, response, ajaxEvent)
        }
    }

    _insertAuthorization(enderessable, ajax){
        let token = enderessable.apiBase?.getToken?.();
        if(token) ajax.setRequestHeader('Authorization', token)
    }

    _sendAjax(method){
        let ajax = new XMLHttpRequest(),
            enderessable = this.enderessable,
            content = this.data;
        this.ajax = ajax
        ajax.open(method.toUpperCase(), enderessable.urlDest, true)
        this._insertAuthorization(enderessable, ajax)
        ajax.onreadystatechange = this._onreadystatechange
        if(this.contentType){
            ajax.setRequestHeader('Content-type', this.contentType)
            if(this.contentType.split(';')[0] == 'application/json') content = JSON.stringify(content)
        }
        this.headers.forEach(header => ajax.setRequestHeader(header.name, header.value))
        this.onbefore?.(ajax)
        ajax.send(content)
    }

    _ajaxResponse(ajax){

        let resp = ajax.currentTarget;
        if (resp.readyState == 4) {

            let {status, response, responseText} = resp,
                details = response || responseText,
                codeType = Math.floor(status/100),
                hasError = codeType > 3;

            resp.contentType = resp.getResponseHeader('content-type')
            DEVELOPMENT_MODE?.log?.(hasError, `%cstatus: ${status} ${resp.statusText}\n${details}`, DEVELOPMENT_MODE.ERROR)
            try { if(resp.contentType == 'application/json') details = JSON.parse(details)} catch (e) {console.log(e)}

            resp.details = details
            resp.codeType = codeType
            resp.success = codeType == 2
            resp.hasError = hasError

            resp.getHeader = resp.getResponseHeader
            resp.getAllHeaders = resp.getAllResponseHeaders
            return resp
        }
    }

}

class Validation{
    constructor(valid, message, input){
        overJson({valid, message, input, isValidation: true}, this)
        if(typeof this.valid != 'boolean') throw `type of valid must be a boolean or a function that returns a boolean.\nconfirm: ${confirm}\nmessage: ${message}`
    }

    static validate(... validations){

        validations = validations.map(validation => {
            if(!validation.isValidation) validation = new Validation(validation[0], validation[1], validation[2])
            if(validation.input && validation.input.errorGroup_){
                disapend(validation.input.errorGroup_)
                validation.input.errorGroup_ = null
            }
            return validation;
        }).filter(validation => !validation.valid)
        return {valid: !validations.length, errors: validations, first: validations[0]}
    }

    static appendErrors(validations, typeGroup='div'){   
        let errors = validations.errors || validations;
        errors.flat(Infinity).filter(validation => validation.input)
            .forEach(validation => {
                let theInput = validation.input;
                if(!theInput.errorGroup_){
                    theInput.errorGroup_ = E[typeGroup]()
                    addClasses(theInput.errorGroup_, "Validation_errorGroup")
                    insertAfter(theInput, theInput.errorGroup_)
                }
                let elementError = E.p().t(validation.message);
                addClasses(elementError, "Validation_elementError")
                validation.input.errorGroup_.a(elementError)
            })
    }

}

class JWTSimpleParser{
    constructor(token){
        this.token = token;
        this.jobToken = token;
        this._normalize()
        this._extractData()
    }

    _normalize(){
        let parts = this.token.split(' ');
        this.prefix = ''
        if(parts.length == 2){
            this.prefix = parts[0] + ' '
            this.jobToken = parts[1]
        }
    }

    _extractData(){
        let jwt = this.jobToken.split('.')
        this.header = this._parse(jwt[0])
        this.payload = this._parse(jwt[1])
        this.signature = jwt[2]
    }

    _parse(tokenPart){
        return JSON.parse(fromBase64(tokenPart))
    }

    getHeader(headerName){
        return headerName? this.header[headerName] : this.header
    }

    getClaim(claimName){
        return this.payload[claimName]
    }

    getPayload(){
        return this.payload
    }

    getToken(){
        return this._token
    }

    isExpired(){
        let now = new Date(),
            len = (now.getTime()+'').length,
            exp = this.payload.exp_? new Date(this.payload.exp_):
                +(this.payload.exp+'').replace('.','').padEnd(len, '0').substring(0, 13);
        return !isNaN(exp)? new Date(exp) < now: false;
    }
}

class SimpleSearch{
    constructor(subPath, value, page = 0, linesPerPage = 12, orderBy = '', direction = 'ASC'){
        overJson({subPath, value, page, linesPerPage, orderBy, direction}, this)
    }
}

class JTable extends JView{

    constructor(...columns){
        super().mount_()
        this._loadData(columns)
    }

    _init(){
        A.table('table').a(
            A.thead('head'),
            A.tbody('body'),
            A.tfoot('foot')
        )
    }

    _loadData(columns){
        columns.length && this.setHeadRowFromItems(columns.flat(Infinity))
    }

    clearBody(){ removeChildren(this.$body)}

    reloadBody(doOverRows){
        let rows = this.getBodyRows();
        doOverRows?.(rows)
        this.clearBody()
        rows.forEach(row => this.addBodyRow(row))
    }

    getHeadRow = () => this.$head.firstChild

    getBodyRows = () => [... this.$body.children]

    getFootRow = () => this.$foot.firstChild

    zebrar(startIndex = 1, step = 2){
        this.getBodyRows().forEach((row, index) => {
            this.removeClasses_(row, 'zebrar')
            if(index == startIndex){
                this.insertClasses_(row, 'zebrar')
                startIndex += step
            } 
        })
        return this
    }

    setHeadRowFromItems(elements, applyItemFunction, applyRowFunction){
        return this._createRow(elements, applyRowFunction, applyItemFunction, this.setHeadRow, ['th'])
    }

    setHeadRow = (rowElement, applyRowFunction) =>{
        removeChildren(this.$head)
        return this._addRow(rowElement, this.$head, applyRowFunction, ['row', 'head_row'])
    }

    addBodyRowFromItems(elements, applyItemFunction, applyRowFunction){
        return this._createRow(elements, applyRowFunction, applyItemFunction, this.addBodyRow, ['td', 'body_td'])
    }

    addBodyRow = (rowElement, applyRowFunction) => {
        return this._addRow(rowElement, this.$body, applyRowFunction, ['row', 'body_row'])
    }

    setFootRowFromItems(elements, applyItemFunction, applyRowFunction){
        return this._createRow(elements, applyRowFunction, applyItemFunction, this.setFootRow, ['td', 'foot_td'])
    }  

    setFootRow = (rowElement, applyRowFunction) => {
        removeChildren(this.$foot)
        return this._addRow(rowElement, this.$foot, applyRowFunction, ['row', 'foot_row'])
    }

    _createRow(elements, applyRowFunction, applyItemFunction, addMethod, clsItem){
        let tr = E.tr(),
            typeItem = clsItem[0];
            
        elements.flat(Infinity).forEach(e => {
            let action = typeof e == 'object' ? 'a' : 't';
            if(!(e instanceof HTMLTableCellElement)) e = E[typeItem]()[action](e)
            applyItemFunction?.(e, this)
            this.insertClasses_(e, clsItem)
            tr.a(e)
        })
        return addMethod(tr, applyRowFunction)
    }

    _addRow(elementRow, elementParent, applyRowFunction, cls){
        applyRowFunction?.(elementRow, this)
        this.insertClasses_(elementRow, cls)
        elementParent.a(elementRow)
        return this
    }
}

function overJson(jsonSource, jsonDest, ... keys){
    keys = keys.flat(Infinity)
    keys = keys.length ? keys : keysOf(jsonSource)
    keys.forEach(key => jsonDest[key] = jsonSource[key])
    return jsonDest
}

function disapend(element){ 
    element = viewOrNode(element);
    removeElements(element.parentNode, element)
}

function consume(evt){ evt.preventDefault()}

const toBase64 = btoa

const fromBase64 = atob

const idGenerator = function*(n = 1){while(n){yield n++}}

const ID_MAKER = idGenerator()

const _c = _create
const _i = _input

function body() {return document.body}
document.body.a = (...elements) => appendTo(document.body, elements)
document.body.disapend = (...elements) => removeElements(document.body, elements)

function _create(tagName) {
    let e = document.createElement(tagName);
    e.isTagChild = true
    e.a = (... elements) => appendTo(e, elements)
    e.c = (... classes) => addClasses(e, classes)
    e.cls = (err = 'cls') => { throw (`[the element was not upgraded by function aMode: [e.${err} not avaliable]`)}
    e.ck = (ck = true) => {e.checked = ck; return e}
    e.d = disabled => {e.disabled = disabled; return e}
    e.h = href => { setAttribute(e, ['href', href]); return e}
    e.otv = (text, value) => {setTextAndValueToOption(e, text, value); return e}
    e.p = (placeHolder) => { e.placeholder = placeHolder; return e}
    e.r = () => {e.required = true; return e}
    e.rmc = (... classes) => removeClasses(e, classes)
    e.rmcls = () => e.cls('rmcls')
    e.t = (text, isLastNode) => {setTextNode(e, text, isLastNode); return e}
    e.v = value => {setValue(e, value); return e}
    return e
}

function _input(type) {
    let e = _c('input');
    setAttribute(e, ['type', type])
    return e
}

const E = {
    createElement: _c,
    createInput: _i,
    a: _ => _c('a'),
    area: _ => _c('area'),
    article: _ => _c('article'),
    aside: _ => _c('aside'),
    audio: _ => _c('audio'),
    br: _ => _c('br'),
    canvas: _ => _c('canvas'),
    col: _ => _c('col'),
    colgroup: _ => _c('colgroup'),
    color: _ => _i('color'),
    datagrid: _ => _c('datagrid'),
    datalist: _ => _c('datalist'),
    dd: _ => _c('dd'),
    dialog: _ => _c('dialog'),
    div: _ => _c('div'),
    dl: _ => _c('dl'),
    dt: _ => _c('dt'),
    embed: _ => _c('embed'),
    fieldset: _ => _c('fieldset'),
    figcaption: _ => _c('figcaption'),
    figure: _ => _c('figure'),
    footer: _ => _c('footer'),
    form: _ => _c('form'),
    frame: _ => _c('frame'),
    frameset: _ => _c('frameset'),
    h1: _ => _c('h1'),
    h2: _ => _c('h2'),
    h3: _ => _c('h3'),
    h4: _ => _c('h4'),
    h5: _ => _c('h5'),
    h6: _ => _c('h6'),
    hgroup: _ => _c('hgroup'),
    hr: _ => _c('hr'),
    iframe: _ => _c('iframe'),
    img: _ => _c('img'),
    inputButton: _ => _i('button'),
    inputCheckBox: _ => _i('checkbox'),
    inputColor: _ => _i('color'),
    inputDate: _ => _i('date'),
    inputDatetimeLocal: _ => _i('datetime-local'),
    inputEmail: _ => _i('email'),
    inputFile: _ => _i('file'),
    inputHidden: _ => _i('hidden'),
    inputImage: _ => _i('image'),
    inputMeter: _ => _c('meter'),
    inputMonth: _ => _i('month'),
    inputNumber: _ => _i('number'),
    inputOption: _ => _c('option'),
    inputPassword: _ => _i('password'),
    inputProgress: _ => _c('progress'),
    inputRadio: _ => _i('radio'),
    inputRange: _ => _i('range'),
    inputReset: _ => _i('reset'),
    inputSearch: _ => _i('search'),
    inputSelect: _ => _c('select'),
    inputSubmit: _ => _i('submit'),
    inputTel: _ => _i('tel'),
    inputText: _ => _i('text'),
    inputTextarea: _ => _c('textarea'),
    inputTime: _ => _i('time'),
    inputWeek: _ => _i('week'),
    inputUrl: _ => _i('url'),
    keygen: _ => _c('keygen'),
    label: _ => _c('label'),
    legend: _ => _c('legend'),
    li: _ => _c('li'),
    map: _ => _c('map'),
    nav: _ => _c('nav'),
    object: _ => _c('object'),
    ol: _ => _c('ol'),
    optgroup: _ => _c('optgroup'),
    option: _ => _c('option'),
    p: _ => _c('p'),
    param: _ => _c('param'),
    progress: _ => _c('progress'),
    q: _ => _c('q'),
    script: _ => _c('script'),
    section: _ => _c('section'),
    span: _ => _c('span'),
    sub: _ => _c('sub'),
    sup: _ => _c('sup'),
    table: _ => _c('table'),
    tbody: _ => _c('tbody'),
    td: _ => _c('td'),
    textarea: _ => _c('textarea'),
    tfoot: _ => _c('tfoot'),
    th: _ => _c('th'),
    thead: _ => _c('thead'),
    tr: _ => _c('tr'),
    track: _ => _c('track'),
    u: _ => _c('u'),
    ul: _ => _c('ul'),
    video: _ => _c('video'),
    wbr: _ => _c('wbr')
}

const aMode = (tag, varName = '$view', tagView) => {
    if(!/^\$/.test(varName)) varName = '$'+varName;
    tagView = tagView || A_MODE_SOURCE

    let e = E[tag]();
    e.cls = (... clsName) => addClasses(e, tagView.defClasses_(clsName))
    e.rmcls = (... clsName) => removeClasses(e, tagView.defClasses_(clsName))
    e.for = (varName_) => {
        e.addEventListener('click', () => {
            let target = varName_? varName_ : 'input'+(varName.split('lbl')[1]);
            tagView[target].focus()
        })
        return e
    }
    tagView[varName] = e
    if(!tagView.$view) {
        tagView.$view = e
        e.cls('view')
    }

    e.cls(varName)
    return e
}

const xMode = tagView => {
    let xMode_ = {};
    keysOf(E).forEach(tag => xMode_[tag] = varName => aMode(tag, varName, tagView))
    
    xMode_.jView = (viewChild, viewParent, varName) => {
        if(!varName){
            varName = viewChild.constructor.name
            varName = varName[0].toLowerCase() + varName.substring(1)
        }
        viewParent["$"+varName] = viewChild
        A_MODE_SOURCE = viewParent
        return viewChild
    }
    return xMode_
}

var A_MODE_SOURCE;

const A = xMode()

const A_SAVED = tagView => xMode(tagView)

function removeElements(parent, ... elements) { 
    elements.flat(Infinity).forEach(e => viewOrNode(parent).removeChild(viewOrNode(e))) 
}

function setAttributes(node, matrix) {matrix.forEach(linha => node.setAttribute(linha[0], linha[1]))}

function setAttributesImg(img, alt, src) {setAttributes(img, [['alt', alt], ['src', src]])}

function setAttribute(node, array) {node.setAttribute(array[0], array[1])}

function insertAfter(referenceNode, ... nodes) {
    let parentNode = referenceNode.parentNode;
    nodes.flat(Infinity).forEach(node => parentNode.insertBefore(viewOrNode(node), referenceNode.nextSibling))
}

function insertBefore(referenceNode, ... nodes) {
    let parentNode = viewOrNode(referenceNode).parentNode;
    nodes.flat(Infinity).forEach(node => parentNode.insertBefore(viewOrNode(node), referenceNode))
}

function textNode() {return document.createTextNode("")}

function setTextNode(element, txt, isLastNode) {
    if (!element.textNode) {
        element.textNode = textNode()
        if (!isLastNode && element.firstChild) {
            insertBefore(element.firstChild, element.textNode)
        } else {
            appendTo(element, element.textNode)
        }
    }
    changeTextNode(element.textNode, txt)
}

function changeTextNode(txtNode, txt) {txtNode.nodeValue = txt}

function appendTo(parent, ... elements) { 
    elements.flat(Infinity).forEach(e => viewOrNode(parent).appendChild(viewOrNode(e)))
    return parent
}

function jsonInMatrix(jsonMatrix) {
    let {columns, rows} = jsonMatrix;
    
    return rows.reduce((list, row) => {
        let obj = {};
        columns.forEach((colName, colNum) => {
            let value = row[colNum];
            obj[colName] = value?.columns? jsonInMatrix(value) : value;
        })
        return list.concat(obj)
    }, []);
}


function jsonAsMatrix(json) {
    json = JSON.parse(JSON.stringify(json));
    let columns = [], 
        rows = [];
    if(Array.isArray(json) && json.length){
        let isObject = false;
        for(let value of json){
            if(value != null && value != undefined){
                isObject = typeof value == 'object'
                break
            }
        }
        if(isObject){
            json.forEach(obj => {
                let row = [];
                Object.keys(obj).forEach(colName => {
                    let val = obj[colName];
                    !columns.includes(colName) && columns.push(colName)
                    row[columns.indexOf(colName)] = typeof val != 'object' || !val ? val : jsonAsMatrix(val);
                })
                rows.push(row)
            })
        }else{
            rows = Array.from(json);
        }
    }else{
        columns = Object.keys(json);
        columns.forEach(colName => {
            let value = json[colName];
            rows.push(!value || typeof value != 'object' ? value : jsonAsMatrix(value))
        })
    }
    return {columns, rows};
}

function hide(... elements) {elements.forEach(e => viewOrNode(e).style.display = 'none')}

function show(elements, typeDisplay = '') {[elements].flat(Infinity).forEach(e => viewOrNode(e).style = 'display:'+typeDisplay)}

function hideShow(elementToHide, elementToShow, typeShowDisplay = '') {
    hide(elementToHide); 
    show(elementToShow, typeShowDisplay)
}

function redirect(namePage, urlParams = '') {
    namePage = namePage.replace(new RegExp('(.*)\.html$'),'$1') + '.html';
    if(typeof urlParams == 'object')
        urlParams = keysOf(urlParams).map(key => `${key}=${urlParams[key]}`).join('&');
    urlParams = urlParams? urlParams.replace(/^\??(.*)/, '?$1') : ''
    window.location = namePage + urlParams
}

function removeChildren(node){
    node = viewOrNode(node);
    [... node.children].forEach(e => node.removeChild(e))
}

function viewOrNode(node){return node?.$view || node}

function setPlaceHolder(element, text) {element.placeholder = text}

function setValue(element, eValue) {element.value = eValue}

function setValueAndPlaceHolder(element, value, placeHolder) {
    setValue(element, value)
    setPlaceHolder(element, placeHolder)
}

function clickShow(elementClick, elementTarget, typeDisplay, doFocus) {
    let e = viewOrNode(elementTarget);
    hide(e)
    e.tagIsVisible = () => !e.tagVisible

    e.tagToogle = () => {
        e.tagVisible ? hide(e) : show(e, typeDisplay)
        e.tagVisible = !e.tagVisible
        doFocus && e.tagVisible && e.focus()
    }
    viewOrNode(elementClick).addEventListener('click', e.tagToogle)
}

function closeConcurrentElement(controller, nodeNameToStore, currentElement) {
    
    let eTarget = controller[nodeNameToStore];
    if(eTarget) eTarget = viewOrNode(eTarget);
    currentElement = viewOrNode(currentElement)
    if (eTarget && eTarget !== currentElement && !eTarget.tagIsVisible()) eTarget.tagToogle()
    controller[nodeNameToStore] = currentElement
}

function manageEClasses(element, action, ... classes) {
    element = viewOrNode(element)
    element && element.classList[action](... classes.flat(Infinity))
    return element
}

function addClasses(element, classes) {return manageEClasses(element, 'add', classes)}

function removeClasses(element, classes) {return manageEClasses(element, 'remove', classes)}

function labelFor(label, elementTarget) {label.addEventListener('click', _ => elementTarget.focus())}

function keysOf(obj) {return Object.keys(obj)}

function valuesOf(obj) {return Object.values(obj)}

function docSelect(){return document.getSelection()}

function selector(query, element) {return (viewOrNode(element) || document).querySelector(query)}

function selectorAll(query, element) {return (viewOrNode(element) || document).querySelectorAll(query)}

function readImgAsDataURL(imgFile, onload) {
    let reader = new FileReader();
    reader.onload = onload
    reader.readAsDataURL(imgFile)
}   

function imgPreview(inputFileImage, imgPrev, hideImgPreview, onafterchange, typeDisplay = '') {
    inputFileImage.onchange = () => {
        let files = inputFileImage.files,
            img = files[0];
        hideImgPreview && hide(imgPrev)
        img && readImgAsDataURL(img, e => {
            imgPrev.src = e.target.result
            show(imgPrev, typeDisplay)
        })
        onafterchange && onafterchange(img, files)
    }
}

function adjustTextAreas(...textareas){
    textareas.flat(Infinity).forEach($input => {
        $input.rows = 2;
        while($input.scrollHeight > $input.offsetHeight) {
            $input.rows += 1;
        }
    })
}

function nextBoolean() {return Math.random() < .5}

function setTextAndValueToOption(option, text, value) {
    option.textContent = text
    option.value = value ?? null
}

function reload(consultServer) {window.location.reload(consultServer)}

function toast(message, toastDuration = 7, elementFocus, cssToast) {
    let bd = body();
    if (bd.toast) {
        removeElements(bd, bd.toast)
        clearTimeout(bd.timeout)
        bd.toast = null
    }
    let e = E.p();
    setTextNode(e, message)
    bd.toast = e
    addClasses(e, ["cssToast","toastfadeIn", cssToast])
    appendTo(bd, bd.toast)
    elementFocus && elementFocus.focus()

    bd.timeout = setTimeout(() => {
        addClasses(bd.toast, "toastfadeOut")
        removeElements(bd, bd.toast)
        bd.toast = null
    }, toastDuration * 1000)
}

function isSamePage(pageName) {
    let page = window.location.href.split('/').slice(-1)[0];
    return pageName.toLowerCase() === page.toLowerCase()
}

function transitoryClass(element, duration, classes) {
    addClasses(element, classes)
    setTimeout(() => removeClasses(element, classes), duration * 1000)
}

function transitorySuccess(response, elementInput, doFocus, duration = 5, cssSuccess = 'fontColorBlue', cssError='fontColorRed') {
    if (response.success) {
        transitoryClass(elementInput, duration, cssSuccess)
        removeClasses(elementInput, cssError)
        return
    }
    removeClasses(elementInput, cssSuccess)
    addClasses(elementInput, cssError)
    doFocus && elementInput.focus()
}

function multiSort(array, ... ordenations){
    ordenations = ordenations.map((item, index) => {
        if(!item || typeof item == 'boolean') return false
        let reverse = ordenations[index+1];
        reverse = typeof reverse == 'boolean' ? reverse : false;
        if(typeof item == 'string') return {key: item, reverse}
        return item
    }).filter(ordenation => ordenation)

    ordenations.reverse().forEach(ordenation => {
        let key = ordenation.key,
            reverse = ordenation.reverse ? -1 : 1;
        array.sort((prev, next) =>{
            if(prev[key] == next[key]) return 0
            return prev[key] > next[key] ? 1 * reverse : -1 * reverse
        })
    })
}

function urlParams(){
    let href = window.location.href,
        indexToken = href.indexOf('?');
    if(indexToken < 0) return {}

    return href.substring(indexToken+1).split('&')
        .reduce((accumulator, arg) => {
            let tokenIndex = arg.indexOf('='); 
            accumulator[arg.substring(0, tokenIndex)]=arg.substring(tokenIndex+1);
            return accumulator
        },{});
}

function isMobileDevice() {
    return /Mobi|Android/i.test(navigator.userAgent);
}
