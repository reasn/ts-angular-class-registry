module ClassRegistry {

    export interface IWrappableClass extends Function {
        __registration: IRegistration;
    }
}