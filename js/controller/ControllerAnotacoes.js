class ControllerAnotacoes extends JMount {
    constructor() {
        super({
            anotacoes: [],
            loadAnotacoes: false,
            versiculos: [],
            loadVersiculosEstudo:false
        }).mount_()
    }

    _init() {
        this.estudo = API_BIBLIA.getEstudo()
        this.viewInitialize = new ViewInitialize()
        this.viewMenu = new ViewMenu()
        this.viewInitialize.setViewMenu(this.viewMenu)
        this.viewMenu.$txtMenu.t('Estudo: ' + this.estudo.titulo)
        this.viewNavegacaoAnotacoes = new ViewNavegacaoAnotacoes()
        this.viewInitialize.setViewNavigation(this.viewNavegacaoAnotacoes)
        this.viewInitialize.setViewContent(
            A.p('txtSelecioneAnotacao').t('Selecione uma anotação para visualizar o conteúdo').c('centerText')
        )
        hide(this.viewNavegacaoAnotacoes.$txtInfo)
        appendTo(body(), this.viewInitialize)
    }

    _appends() {

    }

    _events() {
        this.eventAddAnotacao()
        this.eventVoltar()
    }

    _requests() {
        this.requestAnotacoes()
    }

    requestAnotacoes() {
        let enderessable = API_BIBLIA.toEstudos(`${this.estudo.id}/anotacoes`);

        JRequest.prepare(enderessable)
            .inResponse(
                anotacoes => {
                    if (anotacoes.length > 0) {
                        anotacoes.forEach(anotacao => this.anotacoes.push(anotacao))
                        this.loadAnotacoes = true
                    }
                    this.populateAnotacoes()
                },
                error => new Aspect(error)
            ).get()
    }

    eventAddAnotacao() {
        this.viewNavegacaoAnotacoes.$formAdicionarAnotacao.onsubmit = event => {
            consume(event)
            let titulo = this.viewNavegacaoAnotacoes.$inputTitulo.value,
                txtInfo = this.viewNavegacaoAnotacoes.$txtInfo;

            hide(txtInfo)

            if (!titulo) {
                txtInfo.t('O título é obrigatório')
                show(txtInfo)
                return
            }

            let hasTitulo = this.anotacoes.some(anotacao => anotacao.titulo.toLowerCase() == titulo.toLowerCase())
            if (hasTitulo) {
                txtInfo.t('Já existe uma anotação com esse título')
                show(txtInfo)
                return
            }

            let enderessable = API_BIBLIA.toEstudos(`${this.estudo.id}/anotacoes`)

            JRequest.prepare(enderessable, { titulo })
                .inResponse(
                    anotacaoId => {
                        this.viewNavegacaoAnotacoes.$inputTitulo.value = ''
                        hide(txtInfo)
                        let anotacao = { id: anotacaoId, titulo, texto: '' };
                        this.anotacoes.push(anotacao)
                        this.populateAnotacoes(anotacaoId)
                    },
                    error => new Aspect(error)
                ).post()

        }

    }

    populateAnotacoes(currentAnotacaoId) {
        
        let divNavegacaoAnotacoes = this.viewNavegacaoAnotacoes.$divNavegacaoAnotacoes;
        
        removeChildren(divNavegacaoAnotacoes)
        if (this.anotacoes.length == 0) {
            let p = E.p().t('Nenhuma anotação encontrada').c('centerText')
            divNavegacaoAnotacoes.a(p)
            return
        }

        let currentViewRowNavegacaoAnotacao;
        this.anotacoes.sort((a, b) => a.titulo.toLowerCase().localeCompare(b.titulo.toLowerCase()))
            .forEach(anotacao => {
                let viewRowNavegacaoAnotacao = new ViewRowNavegacaoAnotacao(anotacao);
                divNavegacaoAnotacoes.a(viewRowNavegacaoAnotacao)
                this.requestAnotacao(viewRowNavegacaoAnotacao)
                this.eventDeleteAnotacao(viewRowNavegacaoAnotacao)
                if(anotacao.id == currentAnotacaoId){
                    currentViewRowNavegacaoAnotacao = viewRowNavegacaoAnotacao
                }
                if(!this.catchFirstViewRowNavegacaoAnotacao){
                    this.catchFirstViewRowNavegacaoAnotacao = true;
                    viewRowNavegacaoAnotacao.$txtTitulo.click();
                }
            });
        
        if(currentViewRowNavegacaoAnotacao){
            currentViewRowNavegacaoAnotacao.$txtTitulo.click();
        }
    }

    requestAnotacao(viewRowNavegacaoAnotacao) {
        viewRowNavegacaoAnotacao.$txtTitulo.onclick = () => {
            if(this.currentViewRowNavegacaoAnotacao == viewRowNavegacaoAnotacao) return;
            if(this.currentViewRowNavegacaoAnotacao){
                this.currentViewRowNavegacaoAnotacao.$view.rmcls('backgroundLightGreen')
            }
            viewRowNavegacaoAnotacao.$view.cls('backgroundLightGreen')
            this.currentViewRowNavegacaoAnotacao = viewRowNavegacaoAnotacao;
            let enderessable = API_BIBLIA.toAnotacoes(viewRowNavegacaoAnotacao.id);
            JRequest.prepare(enderessable)
                .inResponse(
                    anotacao => {
                        if (!anotacao) {
                            toast('Anotação não encontrada')
                            return
                        }
                        let viewContentAnotacao = new ViewContentAnotacao(anotacao);
                        this.viewInitialize.setViewContent(viewContentAnotacao)
                        this.viewInitialize.setViewContent(viewContentAnotacao)
                        this.eventEditTituloAnotacao(viewContentAnotacao, viewRowNavegacaoAnotacao)
                        this.currentViewContentAnotacao = viewContentAnotacao;
                        viewRowNavegacaoAnotacao.viewContentAnotacao = viewContentAnotacao;
                        this.editTextoAnotacao(viewContentAnotacao)
                        viewContentAnotacao.showDivAnotacao()
                        this.showEditTextoAnotacao(viewContentAnotacao)
                        !anotacao.texto && viewContentAnotacao.$spanEditarTexto.click()
                        this.requestVersiculosEstudo()
                    },
                    error => new Aspect(error)
                ).get()
        }
    }

    eventEditTituloAnotacao(viewContentAnotacao, viewRowNavegacaoAnotacao) {
        let showFormEditarTitulo,
            formEditarTitulo = viewContentAnotacao.$formEditarTitulo;

        hide(formEditarTitulo)

        viewContentAnotacao.$spanEditar.onclick = () => {
            showFormEditarTitulo = !showFormEditarTitulo
            formEditarTitulo.style.display = showFormEditarTitulo ? 'block' : 'none'
        }

        this.requestEditTituloAnotacao(viewContentAnotacao, viewRowNavegacaoAnotacao)
    }

    requestEditTituloAnotacao(viewContentAnotacao, viewRowNavegacaoAnotacao) {
        viewContentAnotacao.$formEditarTitulo.onsubmit = event => {
            consume(event)
            let novoTitulo = viewContentAnotacao.$inputEditTitulo.value;
            if (novoTitulo == viewContentAnotacao.titulo) {
                viewContentAnotacao.$spanEditar.click()
                return
            }

            let hasAnotacao = this.anotacoes.some(anotacao => anotacao.titulo.toLowerCase() == novoTitulo.toLowerCase())
            if (hasAnotacao) {
                toast('Já existe uma anotação com esse título ...')
                return
            }

            let enderessable = API_BIBLIA.toAnotacoes(viewContentAnotacao.id + '/titulo');
            JRequest.prepare(enderessable, novoTitulo, 'text/plain')
                .inResponse(
                    _ => {
                        viewContentAnotacao.$txtTitulo.t(`Título: ${novoTitulo}`)
                        viewContentAnotacao.titulo = novoTitulo
                        viewContentAnotacao.$spanEditar.click()
                        let anotacaoInList = this.anotacoes.find(anotacao => anotacao.id == viewContentAnotacao.id)
                        if (anotacaoInList) anotacaoInList.titulo = novoTitulo;
                        viewRowNavegacaoAnotacao.$txtTitulo.t(novoTitulo)

                    },
                    error => new Aspect(error)
                ).put()
        }
    }

    eventDeleteAnotacao(viewRowNavegacaoAnotacao) {
        viewRowNavegacaoAnotacao.$spanExcluir.onclick = () => {

            let title = 'Atenção',
                message = "Confirma a exclusão da anotação?";
            new Dialog(message, title, () => {

                let enderessable = API_BIBLIA.toEstudos(`${this.estudo.id}/anotacoes/${viewRowNavegacaoAnotacao.id}`);
                JRequest.prepare(enderessable)
                    .inResponse(
                        _ => {
                            this.anotacoes = this.anotacoes.filter(anotacao => anotacao.id != viewRowNavegacaoAnotacao.id)
                            disapend(viewRowNavegacaoAnotacao)
                            let currentAnotacaoId = this.currentViewContentAnotacao?.id,
                                targetAnotacaoId = viewRowNavegacaoAnotacao.viewContentAnotacao?.id,
                                removeCurrentViewContentAnotacao = currentAnotacaoId && targetAnotacaoId && currentAnotacaoId == targetAnotacaoId;

                            if (removeCurrentViewContentAnotacao) {
                                disapend(this.currentViewContentAnotacao)
                                this.currentViewContentAnotacao = null
                            }
                            this.populateAnotacoes(this.currentViewContentAnotacao?.id)
                        },
                        error => new Aspect(error)
                    ).delete()
            }).show();
        }
    }

    editTextoAnotacao(viewContentAnotacao) {

        viewContentAnotacao.$btnSalvarAnotacao.onclick = () => this.requestSalvarAnotacao(viewContentAnotacao, true)
        viewContentAnotacao.$inputEditTexto.onkeydown = event => {
            event.key == 'Enter' && this.requestSalvarAnotacao(viewContentAnotacao)
        }
    }

    requestSalvarAnotacao(viewContentAnotacao, closeEdition) {
        let novoTexto = viewContentAnotacao.$inputEditTexto.value || ' ';

        if (novoTexto == viewContentAnotacao.texto && closeEdition) {
            viewContentAnotacao.showDivAnotacao()
            viewContentAnotacao.$spanEditarTexto.click()
            return
        }

        let enderessable = API_BIBLIA.toAnotacoes(viewContentAnotacao.id + '/texto');
        JRequest.prepare(enderessable, novoTexto, 'text/plain')
            .inResponse(
                _ => {
                    viewContentAnotacao.texto = novoTexto
                    viewContentAnotacao.populateTexto()
                    closeEdition && viewContentAnotacao.$spanEditarTexto.click()
                },
                error => new Aspect(error)
            ).put()
    }

    showEditTextoAnotacao(viewContentAnotacao) {
        let showEditTexto;
        viewContentAnotacao.$spanEditarTexto.onclick = () => {
            showEditTexto = !showEditTexto

            if (showEditTexto) {
                viewContentAnotacao.showEditTexto()
            } else {
                viewContentAnotacao.showDivAnotacao()
            }
        }
    }

    eventVoltar() {
        this.viewNavegacaoAnotacoes.$btnVoltar.onclick = () => redirect('index')
    }

    requestVersiculosEstudo(){
        let enderessable = API_BIBLIA.toEstudos(`${this.estudo.id}/versiculos`);
        if(this.loadVersiculosEstudo){
            this.populateVersiculosEstudo()
            return
        }

        JRequest.prepare(enderessable)
            .inResponse(
                versiculos => {
                    this.loadVersiculosEstudo = true;
                    versiculos.sort((a, b) => a.id - b.id)
                    this.versiculosEstudo = versiculos;
                    this.populateVersiculosEstudo()
                },
                error => new Aspect(error)
            ).get()
    }

    populateVersiculosEstudo(){
        if(this.currentViewContentAnotacao){
            this.currentViewContentAnotacao.adicionarVersiculo(E.p().t('--INÍCIO--').c('centerText', 'fontColorGreen'))
            this.versiculosEstudo.forEach(versiculo => {
                let viewRowVersiculo = new ViewRowVersiculo(versiculo);
                this.currentViewContentAnotacao.adicionarVersiculo(viewRowVersiculo)
                disapend(viewRowVersiculo.$spanExcluir)
                disapend(viewRowVersiculo.$spanSelecionar)
                disapend(viewRowVersiculo.$spanEditText)
                viewRowVersiculo.$view.c('identForAnotacao')
                viewRowVersiculo.$txtInfo.rmc('cursorPointer') 
            });

            this.currentViewContentAnotacao.updateCountVersiculosRelacionados(this.versiculosEstudo.length)
            this.currentViewContentAnotacao.adicionarVersiculo(E.p().t('--FIM--').c('centerText', 'fontColorRed'))
        }
    }


}