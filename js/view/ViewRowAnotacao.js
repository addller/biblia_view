class ViewRowAnotacao extends JView{

    constructor(anotacao){
        super(anotacao).mount_()
        this.elementTitles()
    }

    _init(){
        A.div().a(
            A.div('divTitulo').a(
                A.span('spanExcluir').c('sprite', 'delete'),
                A.span('spanEditar').c('sprite', 'edit'),
                A.span('txtTitulo').t(this.titulo)
            ),
            A.div('divConteudo'),
            A.div('divEdit').a(
                A.p('txtAnotacao').t(this.anotacao),
                A.inputButton('btnSalvar1').v('Salvar'),
                A.inputTextarea('inputvarName'),
                A.inputButton('btnSalvar2').v('Salvar')
            )

        )

        this.$view.id = 'viewRowAnotacao' + this.id
    }

    _events(){
        this.populateConteudo()
    }

    populateConteudo(){
        let linhas = this.anotacao.split('\n');

        linhas.array.forEach(linha => {
            let linhaElement = E.p().t(linha)
            this.$divConteudo.a(linhaElement)
        });
    }

    elementTitles(){
        this.$spanExcluir.title = 'Excluir anotação'
        this.$spanEditar.title = 'Editar anotação'
    }

}