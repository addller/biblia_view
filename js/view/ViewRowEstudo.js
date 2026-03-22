class ViewRowEstudo extends JView{

    constructor(estudo){
        super(estudo).mount_()
    }

    _init(){

        A.div().a(
            A.span('spanExcluirEstudo').c('sprite', 'delete'),
            A.span('spanVerVersiculos').c('sprite', 'selectVersiculo'),
            A.span('spanAdicionarVersiculos').c('sprite', 'spanAdd'),
            A.span('spanEditarTitulo').c('sprite', 'edit'),
            A.span('txtTitulo').t(this.titulo),
            A.form('formEditarTitulo').a(
                A.inputText('inputEditarTitulo').v(this.titulo),
                A.inputSubmit('btnSaveTitulo').v('Salvar')
            )
        )
        
    }

}