/// <reference path="./IRegistration" />

module ClassRegistry {

    export interface IWrappableClass extends Function {
        __registration: IRegistration;
    }
}