class ViewRowEstudo extends JView{

    constructor(estudo){
        super(estudo).mount_()
        this.elementTitles()
        this.markIfHasAnotacao()
    }

    _init(){

        A.div().a(
            A.div('groupActions').a(
                A.span('spanExcluirEstudo').c('sprite', 'delete'),
                A.span('spanAdicionarVersiculos').c('sprite', 'spanAdd'),
                A.span('spanVerVersiculos').c('sprite', 'selectVersiculo'),
                A.span('spanEditarTitulo').c('sprite', 'edit'),
                A.span('txtTitulo').t(this.titulo)
            ),
            A.form('formEditarTitulo').a(
                A.inputSubmit('btnSaveTitulo').v('Salvar'),
                A.inputText('inputEditarTitulo').v(this.titulo)
            )
        )
        
    }

    elementTitles(){
        this.$spanExcluirEstudo.title = 'Excluir estudo'
        this.$spanAdicionarVersiculos.title = 'Adicionar versículos ao estudo'
        this.$spanVerVersiculos.title = 'Ver versículos do estudo'
        this.$spanEditarTitulo.title = 'Editar título do estudo'
    }

    markIfHasAnotacao(){
        if(this.hasAnotacoes){
            this.insertClasses_(this.$view, 'hasAnotacao')
            this.$txtTitulo.title = 'Este estudo possui anotações'
        }
    }

}