class ControllerIndex extends JMount{
    constructor() {
        super(
            {
                livros:[],
                versiculosSelecionados:[],
                totalVersiculos: 0,
                loadEstudos: false,
                estudos: [],
                estudoAberto: null
            }
        ).mount_()
        
    }

    _init() {

        this.viewIndex = new ViewIndex();
        this.viewPesquisa = new ViewPesquisa();
        this.viewVersiculos = new ViewVersiculos();
        this.viewEstudos = new ViewEstudos();

        this.viewIndex.$divPesquisa.a(this.viewPesquisa)
        this.viewIndex.$divVersiculos.a(this.viewVersiculos)
        this.viewIndex.$divEstudos.a(this.viewEstudos)

        appendTo(body(), this.viewIndex)


    }

    _requests(){
        this.requestLivros()
        this.requestEstudos()
    }

    _events(){
        this.eventSelectLivro()
        this.eventUpdateNumeroCapitulo()
        this.eventPesquisaGeral()
        this.eventPesquisaNoLivro()
        this.eventAdicionarEstudo()
        this.eventPesquisarEstudos()
    }

    requestLivros(){
        
        let enderessable = API_BIBLIA.toLivro();
        
        JRequest.prepare(enderessable)
            .inResponse(
                livros => {
                    this.loadLivros(livros)
                },
                error => {
                    new Aspect(error)
                }
        ).get()
    }

    loadLivros(livros){
        
        let inputSelectLivros = this.viewPesquisa.$inputSelectLivros;

        livros.forEach(livro => {
            inputSelectLivros.a(A.inputOption('optLivro' + livro.id).otv(livro.titulo, livro.id))
            this.livros.push(livro)
        })
        this.selectedLivro = livros[0]
        this.updateFieldNumeroCapitulos()
        this.getVersiculos()

    }

    eventSelectLivro(){

        this.viewPesquisa.$inputSelectLivros.onchange = e =>{
            let livroId = e.target.value
            this.selectedLivro = this.livros.filter(livro => livro.id == livroId)[0]
            this.updateFieldNumeroCapitulos()
            this.getVersiculos()
        }
    }

    updateFieldNumeroCapitulos(){
        let numeroCapitulos = this.selectedLivro.capitulos;

        this.viewPesquisa.$spanCapitulos.t(`de ${numeroCapitulos}`)
        this.viewPesquisa.$inputNumeroCapitulo.max = numeroCapitulos
    }

    getVersiculos(){

        let params = {idLivro: this.selectedLivro.id, capitulo: this.viewPesquisa.$inputNumeroCapitulo.value},
            enderessable = API_BIBLIA.toVersiculos(params);
        
        JRequest.prepare(enderessable)
            .inResponse(
                versiculos => {
                    this.populateVersiculos(versiculos)
                    this.totalVersiculos = versiculos.length;
                    this.viewPesquisa.updateTotalVersiculos(this.totalVersiculos)
                },
                error => new Aspect(error),
        ).get()
    }

    populateVersiculos(versiculos){
        let divVersiculos = this.viewPesquisa.$divVersiculos;
        removeChildren(divVersiculos)

        versiculos.forEach(versiculo => {
            let viewRowVersiculo = new ViewRowVersiculo(versiculo);
            viewRowVersiculo.$spanExcluir.style.display = 'none'
            this.viewPesquisa.$divVersiculos.a(viewRowVersiculo)
            this.eventSelectVersiculo(viewRowVersiculo)
        })
        this.viewPesquisa.updateTotalVersiculos(versiculos.length)
    }

    eventUpdateNumeroCapitulo(){
        this.viewPesquisa.$inputNumeroCapitulo.onchange = _ => {
            this.getVersiculos()
        }
    }

    eventPesquisaGeral(){

        let inputBuscarEmTodosOsLivros = this.viewPesquisa.$inputBuscarEmTodosOsLivros;

        inputBuscarEmTodosOsLivros.onkeypress = e => {
            let texto = inputBuscarEmTodosOsLivros.value;

            if(e.key == 'Enter' && texto){
                let fragment = {
                    subPath: 'pesquisa/geral',
                    texto
                }

                let enderessable = API_BIBLIA.toVersiculos(fragment);
                
                JRequest.prepare(enderessable)
                    .inResponse(
                        versiculos => this.populateVersiculos(versiculos),
                        error => new Aspect(error),
                ).get()
            }
            
        }

    }

    eventPesquisaNoLivro(){
        let inputBuscaNoLivro = this.viewPesquisa.$inputBuscarNoLivro;
        inputBuscaNoLivro.onkeypress = e => {
            let texto = inputBuscaNoLivro.value;
            if(e.key == 'Enter' && texto){
                let fragment = {
                    subPath: 'pesquisa/livro',
                    livroId: this.selectedLivro.id,
                    texto
                }

                let enderessable = API_BIBLIA.toVersiculos(fragment);
 
                JRequest.prepare(enderessable)
                    .inResponse(
                        versiculos => this.populateVersiculos(versiculos),
                        error => new Aspect(error)
                ).get()
            }
        }
    }

    eventSelectVersiculo(viewRowVersiculo){
        viewRowVersiculo.$spanSelecionar.onclick = _ => {
            let hasVersiculo = this.versiculosSelecionados
                .filter(versiculo => versiculo.id == viewRowVersiculo.id)
                .length > 0;

            if(hasVersiculo) return;
            let {id, verso, texto} = viewRowVersiculo;
            let viewRowVersiculoSelected = new ViewRowVersiculo({id, verso, texto});
            viewRowVersiculoSelected.$spanSelecionar.style.display = 'none'
            this.viewVersiculos.$divVersiculosSelecionados.a(viewRowVersiculoSelected)
            this.versiculosSelecionados.push({id, verso, texto})
            this.eventRemoveSelectedVersiculo(viewRowVersiculoSelected)   
        }
    }

    eventRemoveSelectedVersiculo(viewRowVersiculo){
        viewRowVersiculo.$spanExcluir.onclick = _ => {
            this.versiculosSelecionados = this.versiculosSelecionados.filter(versiculo => versiculo.id != viewRowVersiculo.id)
            disapend(viewRowVersiculo)
        }
    }

    eventAdicionarEstudo(){

        let inputAdicionarEstudo = this.viewEstudos.$inputAdicionarEstudo;

        inputAdicionarEstudo.onkeypress = e => {
            let titulo = inputAdicionarEstudo.value;

            if(e.key == 'Enter' && titulo && this.loadEstudos){    
                    
                let hasEstudo = this.estudos.filter(estudo => estudo.titulo.toLowerCase() == titulo.toLowerCase()).length > 0;
                if(hasEstudo){
                    this.viewEstudos.$txtErrorAdicionarEstudo.t('Já existe um estudo com esse título.')
                    return;
                }
    
                let enderessable = API_BIBLIA.toEstudos();
                JRequest.prepare(enderessable, {titulo})
                    .inResponse(
                        estudo => this.populateViewRowEstudos(estudo),
                        error => new Aspect(error)
                ).post()
                
            }

        }

    }

    requestEstudos(){
        
        let enderessable = API_BIBLIA.toEstudos();
        
        JRequest.prepare(enderessable)
            .inResponse(
                estudos => {
                    this.loadEstudos = true;
                    estudos.forEach(estudo => this.populateViewRowEstudos(estudo))
                },
                error => new Aspect(error),
        ).get()
    }

    eventAddVersiculosAoEstudo(viewRowEstudo){
        viewRowEstudo.$spanAdicionarVersiculos.onclick = _ => {
            let versiculosIds = this.versiculosSelecionados.map(versiculo => versiculo.id);
            if(versiculosIds.length > 0){
                let fragment = {
                    subPath: `${viewRowEstudo.id}/versiculos`,
                }
                let enderessable = API_BIBLIA.toEstudos(fragment)

                JRequest.prepare(enderessable, versiculosIds)
                    .inResponse(
                        _ => {
                            this.versiculosSelecionados = [];
                            removeChildren(this.viewVersiculos.$divVersiculosSelecionados)
                            debugger
                        },
                        error => new Aspect(error),
                ).put()
            }
        }
    }

    eventGetVersiculosEstudo(viewRowEstudo){

        viewRowEstudo.$spanVerVersiculos.onclick = _ => {
            let fragment = {
                subPath: `${viewRowEstudo.id}/versiculos`
            }

            let enderessable = API_BIBLIA.toEstudos(fragment);
            
            JRequest.prepare(enderessable)
                .inResponse(
                    versiculos => {
                        versiculos.sort((a, b) => a.id > b.id ? 1 : -1)
                        removeChildren(this.viewVersiculos.$divVersiculosLinkados)
                        versiculos.forEach(versiculo => {
                            let viewRowVersiculo = new ViewRowVersiculo(versiculo);
                            viewRowVersiculo.$spanSelecionar.style.display = 'none'
                            this.viewVersiculos.$divVersiculosLinkados.a(viewRowVersiculo)
                            this.requestDeleteVersiculoEstudo(viewRowVersiculo, viewRowEstudo)
                        })
                    },
                    error => new Aspect(error)
            ).get()
        }

    }

    populateViewRowEstudos(estudo){
        let viewRowEstudo = new ViewRowEstudo(estudo);
        this.estudos.push(viewRowEstudo)
        this.estudos.sort((a, b) => a.titulo.toLowerCase() > b.titulo.toLowerCase() ? 1 : -1)
        this.populateEstudos(this.estudos)
        this.eventGetVersiculosEstudo(viewRowEstudo)
        this.eventAddVersiculosAoEstudo(viewRowEstudo)
        this.enableEditEstudo(viewRowEstudo)
        this.requestChangeTituloEstudo(viewRowEstudo)
        this.requestDeleteEstudo(viewRowEstudo)
    }

    enableEditEstudo(viewRowEstudo){
        let spanEditarTitulo = viewRowEstudo.$spanEditarTitulo;

        spanEditarTitulo.showForm = false;
        viewRowEstudo.$spanEditarTitulo.onclick = _ => {
            if(this.estudoAberto && this.estudoAberto !== viewRowEstudo){
                this.estudoAberto.$spanEditarTitulo.click();
                this.estudoAberto = null;
            }

            spanEditarTitulo.showForm = !spanEditarTitulo.showForm;
            if(spanEditarTitulo.showForm){
                viewRowEstudo.$formEditarTitulo.style.display = 'block';
                this.estudoAberto = viewRowEstudo;
            }else{
                viewRowEstudo.$formEditarTitulo.style.display = 'none';
                this.estudoAberto = null;
            }
        }
    }

    requestChangeTituloEstudo(viewRowEstudo){
        viewRowEstudo.$formEditarTitulo.onsubmit = e => {
            consume(e)
            this.viewEstudos.showError('')
            let oldTitulo = viewRowEstudo.titulo,
                newTitulo = viewRowEstudo.$inputEditarTitulo.value;
            
            let hideForm = _ => {
                viewRowEstudo.$spanEditarTitulo.click();
            }

            if(oldTitulo.toLowerCase() == newTitulo.toLowerCase()){
                hideForm();
                return
            }

            let hasEstudo = this.estudos.filter(estudo => estudo.titulo.toLowerCase() == newTitulo.toLowerCase()).length > 0;
            if(hasEstudo){
                this.viewEstudos.showError('Já existe um estudo com esse título.')
                return;
            }

            let enderessable = API_BIBLIA.toEstudos(),
                data = {
                    id: viewRowEstudo.id, 
                    titulo: newTitulo
                };
            
            JRequest.prepare(enderessable, data)
                .inResponse(
                    _ => {
                        viewRowEstudo.titulo = newTitulo;
                        viewRowEstudo.$txtTitulo.t(newTitulo)
                        hideForm();},
                    error => new Aspect(error)
            ).put()   
        }
    }

    requestDeleteEstudo(viewRowEstudo){
        viewRowEstudo.$spanExcluirEstudo.onclick = _ => {
            let title = "Atenção",
                message = "Confirma a exclusão deste estudo?";
            new Dialog(message, title, () => {

                let enderessable = API_BIBLIA.toEstudos(viewRowEstudo.id);
                JRequest.prepare(enderessable)
                    .inResponse(
                        _ => {
                            this.estudos = this.estudos.filter(estudo => estudo.id != viewRowEstudo.id)
                            this.populateEstudos(this.estudos)
                        },
                        error => new Aspect(error)
                ).delete()
            }).show();
            
        }
    }

    eventPesquisarEstudos(){
        let inputPesquisarEstudo = this.viewEstudos.$inputPesquisarEstudo;

        inputPesquisarEstudo.onkeypress = e => {
            let textSearch = inputPesquisarEstudo.value;

            if(e.key == 'Enter' && this.loadEstudos){

                if(!textSearch){
                    this.populateEstudos(this.estudos)
                    return;
                }
    
                let estudosPesquisados = this.estudos.filter(estudo => this.matchText(textSearch, estudo.titulo))
                this.populateEstudos(estudosPesquisados)
            }
        }

    }

    matchText(textSearch, targetText){
        let tokens = textSearch.split(' ');
        let counter = 0;

        for(let token of tokens){
            if(targetText.toLowerCase().includes(token.toLowerCase())){
                counter++
            }
        }

        return counter == tokens.length
    }

    populateEstudos(estudos){
        removeChildren(this.viewEstudos.$divEstudos)
        estudos.forEach(estudo => this.viewEstudos.$divEstudos.a(estudo))            
    }

    requestDeleteVersiculoEstudo(viewRowVersiculo, viewRowEstudo){
        viewRowVersiculo.$spanExcluir.onclick = _ => {
            let title = "Atenção",
                message = "Confirma a exclusão deste versículo deste estudo?";
            new Dialog(message, title, () => {

                let fragment = {
                    subPath: `${viewRowEstudo.id}/versiculos/${viewRowVersiculo.id}`
                }
                let enderessable = API_BIBLIA.toEstudos(fragment);
                JRequest.prepare(enderessable)
                    .inResponse(
                        _ => disapend(viewRowVersiculo),
                        error => new Aspect(error)
                ).delete()
            }).show();
        }
    }

}
