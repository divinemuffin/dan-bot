import { EventEmitter } from "events"

interface IMongoFindResponse<T> {
    '$__': {
        strictMode: boolean,
        selected: Object,
        pathsToScopes: Object,
        cachedRequired: Object,
        emitter: EventEmitter,
        '$options': { skipId: true, isNew: false, willInit: true }
    },
    isNew: boolean,
    _doc: T,
}


export {
    IMongoFindResponse
}