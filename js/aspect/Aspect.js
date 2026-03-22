class Aspect{

    constructor(error, in_error, ignoreFor){
        this.errorMessage = error.message || error.error || error;
        if(in_error){
            in_error(this.errorMessage)
            if(ignoreFor) return
        }

        this.for(
            ['User name or password invalid', _ => toast(LANG.user_or_password_invalid)],
            ['JWT strings must contain exactly 2 period characters', _ => ActionsLogin.unlog()],
            ['JWT expired', _ => ActionsLogin.unlog()],
            ['Expired or invalid token', _ => ActionsLogin.unlog()],
            ['JWT String argument cannot be null or empty', _ => ActionsLogin.unlog()]
        )
    }

    for(... confirmations){
        this.actions = confirmations.map(confirmation => confirmation.isConfirmation? confirmation : new Confirmation(confirmation[0], confirmation[1]))
        .filter(confirmation => this.errorMessage.toLowerCase().includes(confirmation.signature.toLowerCase()))
        .map(confirmation => confirmation.action);

        if(!this.actions.length) console.log('Aspect not found for error: ' + this.errorMessage)
        this.actions.forEach(action => action())
    }

    deniedAccess(){
        let user = API_FICHAMENTO.getUser();
        if(!user.roles.includes('ROLE_EMAIL')) return redirect('validate_email')
        toast(LANG.access_denied)
    }

}

class Confirmation{
    constructor(signature, action){
        overJson({signature, action}, this)
        this.isConfirmation = true;
    }
}
