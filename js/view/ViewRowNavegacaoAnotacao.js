class ViewRowNavegacaoAnotacao extends JView{

    constructor(anotacao){
        super(anotacao).mount_()
        this.elementTitles()
    }

    _init(){
        A.div().a(
            A.span('spanExcluir').c('sprite', 'delete'),
            A.span('txtTitulo').t(this.titulo)
        )
    }

    elementTitles(){
        this.$spanExcluir.title = 'Excluir anotação'
    }

}