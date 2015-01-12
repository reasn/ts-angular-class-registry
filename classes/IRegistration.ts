/// <reference path="./IWrappableClass" />

module ClassRegistry {

    export interface IRegistration {
        staticClass:  IWrappableClass;
        namespace:    string;
        dependencies: string[];

    }
}