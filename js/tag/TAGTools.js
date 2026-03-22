class Dialog extends JView{
    constructor(message, title, onConfirm, onNegate) {
        super({message, title, onConfirm, onNegate}).mount_()
    }

    _init() {
        A.div().a(
            A.div('divDialog').a(
                A.p('textTitle').t(this.title),
                A.p('textMessage').t(this.message),
                A.div('groupButtons').a(
                    A.inputButton('btnConfirm').v(LANG?.yes || 'Yes'),
                    A.inputButton('btnNegate').v(LANG?.not || 'Not')
                )
            )
        )
    }

    show() { appendTo(body(), this)}

    remove() { this.disapend_()}

    setConfirmText(text){
        this.$btnConfirm.v(text)
        return this
    }

    setNegateText(text){
        this.$btnNegate.v(text)
        return this
    }

    hideBtnNegate(textToBtnConfirm){
        textToBtnConfirm && this.setConfirmText(textToBtnConfirm)
        hide(this.$btnNegate)
        return this
    }

    hideBtnConfirm(textToBtnNegate){
        textToBtnNegate && this.setNegateText(textToBtnNegate);
        hide(this.$btnConfirm)
        return this
    }

    _events() {
        this.$btnConfirm.onclick = () => {
            this.onConfirm?.()
            this.remove()
        };
        this.$btnNegate.onclick = () => {
            this.onNegate?.()
            this.remove()
        }
    }
}

class Waiter extends JView{

    constructor(message, elementSource, onchange){
        super({message, elementSource, onchange}).mount_()
    }

    _init(){
        A.div('view').a(
            A.div('divContent').a(
                A.p('textMessage').t(this.message),
                A.div('divAnimation')
            )
        )
        A.div('loaderContainer')
        this.loaderContainerVisibility(true)
    }

    loaderContainerVisibility(showing = true){
        let {$loaderContainer} = this;
        if(showing) {
            this.insertClasses_($loaderContainer, 'loaderContainerPosition')
            this.$divAnimation.a(this.$loaderContainer)
        }else{
            hide($loaderContainer)
        }
        return $loaderContainer
    }

    getLoaderContainer(){ 
        return this.$loaderContainer
    }

    setLoaderContainerClasses(...classes){
        this.removeClasses_(this.$loaderContainer, 'loaderContainer')
        this.$loaderContainer.c(classes)
    }

    wait(conditionForWait = true) {
        if(!this.waiting && conditionForWait){
            appendTo(body(), this)
            this.waiting = true
            if(this.elementSource){
                this.elementSource.waiting = true
                this.onchange?.(this.elementSource, true)
            }
            this.animation?.()
        }
    }

    free(){ 
        if(this.waiting){
            this.disapend_()
            this.waiting = false
            if(this.elementSource) this.elementSource.waiting = false
            this.onchange?.(this.elementSource, false)
        }
    }

    showDivAnimation() {show(this.$divAnimation); return this}

    hideDivAnimation() {hide(this.$divAnimation); return this}

    showTextMessage() {show(this.$textMessage); return this}

    hideTextMessage() {hide(this.$textMessage); return this}

    setMessage(message){ this.message = message}

    getDivAnimation(){ return this.$divAnimation}
    
    animation(){
        let counter = 0;
        this.message && setInterval(() => this.$textMessage.t(this.message + ('...'.slice(-counter++ % 3))), 500);
    }

    setAnimation(animation){
        this.animation = animation;
        return this
    }

}

class WordSearch{
	
	constructor(word){
        this.len = word?.length
		this._generateNodes(word)
	}
	
	_generateNodes(word){
		if(word){
			word = word.toLowerCase()
			this.next = {index:0, value: word[0]}
			let iterator = this.next;
			for (let i = 1; i < word.length; i++){
				iterator.next = {index: i, value:word[i]}
				iterator = iterator.next
			}
		}
	}
	
	match(word){
		let source = this.next;
		if(source && word){
            let dest = new WordSearch(word),
            sourceLen = this.len,
            destLen = dest.len;
			while(dest && source){
                if(sourceLen - source.index > destLen - dest.index) return false
				if(source.value == dest.value) source = source.next
				dest = dest.next
            }
			return !source
		}
	}
}

class TextFormat {

    static username(inputText, eventName = 'keydown') {
        inputText.addEventListener(eventName, event => {
            let key = event.key;
            key && !/[\w_]/.test(key) && consume(event)
        });
    }

    static usernameReplaceValue(inputText, eventName = 'keydown') {
        inputText.addEventListener(eventName, event => {
            let timer = setInterval(_ => {
                inputText.value = inputText.value
                    .replace(/[^\w_]/g, '')
                    .replace(/^_+/, '')
                    .replace(/_{2,}$/, '_')
                    .replace(/_+/, '_')
                    .replace(/^\d/, '')
                clearInterval(timer)
            }, 10);
        })
    }
    
    static name(inputText, eventName = 'keydown'){
        inputText.addEventListener(eventName, event => {
            let key = event.key;
            TextFormat._consumeIfReprove(event, 
                key && !/[A-Z ]/i.test(key),
                (/ /.test(key) && inputText.value.length) === 0,
                (/ $/.test(inputText.value) && / /.test(key))
            )
        })
    }

    static nameReplaceValue(inputText, eventName = 'keydown'){
        inputText.addEventListener(eventName, event => {
            let timer = setInterval(_ => {
                inputText.value = inputText.value
                    .replace(/[^a-z ]/gi, '')
                    .replace(/\s{2,}/g, ' ')
                    .replace(/^\s{1,}/, '')
                clearInterval(timer)
            }, 10);
        })
    }

    static _consumeIfReprove = (event, ... tests) => tests.some(reproved => reproved) && consume(event)
    
    static onlyNumbers(inputText, eventName = 'keydown'){
        inputText.addEventListener(eventName, event => {
            let key = event.key;
            if(['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(key)) return;
            key && !/[\d]/.test(key) && consume(event)
        })
    }

    static acceptKeys(inputText, eventName, ... regex){
        inputText.addEventListener(eventName, event => {
            let key = event.key;
            regex.some(reg => !reg.test(key)) && consume(event)
        })
    }

    static rejectKeys(inputText, eventName, ... regex){
        inputText.addEventListener(eventName, event => {
            let key = event.key;
            regex.some(reg => reg.test(key)) && consume(event)
        })
    }
}
