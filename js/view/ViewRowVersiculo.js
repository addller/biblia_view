class ViewRowVersiculo extends JView{

    constructor(versiculo){
        super(versiculo).mount_()
        this.elementTitles()
        hide(this.$formEditText)
    }

    _init(){
        let aberviacaoLivro = this.livro?.abreviacao || '';

        if(aberviacaoLivro){
            aberviacaoLivro = `${aberviacaoLivro} ${this.capitulo}:`
        }
        A.div().a(
            A.span('spanExcluir').c('sprite', 'delete'),
            A.span('spanEditText').c('sprite', 'edit'),
            A.span('spanSelecionar').c('sprite', 'selectVersiculo'),
            A.span('txtInfo').t(`${aberviacaoLivro}${this.verso}. `).c('fontColorBlue', 'cursorPointer'),
            A.span('txtVersiculo').t(this.texto),
            A.form('formEditText').a(
                A.inputTextarea('inputEditText').v(this.texto),
                A.inputSubmit('btnEditText').v('Salvar')
            )
        )
        
    }

    elementTitles(){
        this.$spanExcluir.title = 'Excluir versículo do estudo'
        this.$spanSelecionar.title = 'Selecionar versículo para adicionar ao estudo'
    }

    hideSpanExcluir(){
        hide(this.$spanExcluir)
    }

     hideSpanSelecionar(){
        hide(this.$spanSelecionar)
    }

     hideSpanEditText(){
        hide(this.$spanEditText)
    }

}