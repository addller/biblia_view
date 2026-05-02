class ViewContentAnotacao extends JView{

    constructor(anotacao){
        super(anotacao).mount_()
        this.populateTexto()
        this.populateEditTexto()
        this.elementTitles()
    }

    _init(){
        this.texto = this.texto || '';

        A.div().a(
            A.div('divControles').a(
                A.span('spanEditar').c('sprite', 'edit'),
                A.span('txtTitulo').t(`Título: ${this.titulo}`).c('fontColorBlue'),
                E.br(),
                A.form('formEditarTitulo').a(
                    A.inputSubmit('btnSalvarTitulo').v('Salvar'),
                    A.inputText('inputEditTitulo').r()
                )
            ),
            A.div('groupFields').a(
                A.div('divAnotacao'),
                A.div('divEditTexto').a(
                    A.inputTextarea('inputEditTexto').p('Editar anotação'),
                    A.inputButton('btnSalvarAnotacao').v('Salvar')
                ),
                A.div('divVersiculos').a(
                    A.p('txtVersiculos').t('Versículos relacionados'),
                )
            )
        )

        this.anotacaoheader = A.p('txtAnotacao').a(
            A.span('spanEditarTexto').c('sprite', 'edit'),
            A.span('lblAnotacao').t('Anotação')
        );
    }

    _limits(){
        this.$inputEditTexto.maxLength = 10000;
    }

    populateTexto(){
        let linhas = this.texto.split('\n'),
            divAnotacao = this.$divAnotacao;

        removeChildren(divAnotacao)
        divAnotacao.a(this.anotacaoheader)
        divAnotacao.a(E.p().t('---INÍCIO---').c('centerText', 'fontColorGreen'))

        linhas.forEach(linha => {
            let linhaElement = E.p().t(linha)
            this.insertClasses_(linhaElement, 'linhaAnotacao')
            divAnotacao.a(linhaElement)
        });

        divAnotacao.a(E.p().t('--FIM--').c('centerText', 'fontColorRed'))
    }

    populateEditTexto(){
        this.$inputEditTexto.value = this.texto
    }

    showEditTexto(){
        hide(this.$divAnotacao)
        show(this.$divEditTexto)
        this.$groupFields.cls('groupFieldsConfigEdicao')
        this.$groupFields.rmcls('groupFieldsConfigAnotacao')

    }

    showDivAnotacao(){
        show(this.$divAnotacao)
        hide(this.$divEditTexto)
        this.$groupFields.cls('groupFieldsConfigAnotacao')
        this.$groupFields.rmcls('groupFieldsConfigEdicao')
    }

    elementTitles(){
        this.$spanEditar.title = 'Editar título da anotação'
        this.$spanEditarTexto.title = 'Editar texto da anotação'
    }

    adicionarVersiculo(viewRowVersiculo){
        this.$divVersiculos.a(viewRowVersiculo)
    }

    updateCountVersiculosRelacionados(count){
        this.$txtVersiculos.t(`Versículos relacionados: ${count}`)
    }
}