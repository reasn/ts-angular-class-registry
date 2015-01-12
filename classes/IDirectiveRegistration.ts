/// <reference path="./IRegistration" />

module ClassRegistry {

export interface IDirectiveRegistration extends IRegistration {
        name:         string;
        registration: any;
    }
}