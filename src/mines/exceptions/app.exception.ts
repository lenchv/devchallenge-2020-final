export class AppException {
    constructor(public readonly message: string, public readonly details: Object = {}) {}
}
