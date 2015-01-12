/// <reference path="./IController" />
/// <reference path="./IDirective" />

module ClassRegistry {

export interface IDirectiveRegistration extends IRegistration {
        name:         string;
        registration: any;
    }
}