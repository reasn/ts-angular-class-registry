module ClassRegistry {
    export interface IInjectableFunction {
        (...arguments: any[]): any;
        $inject?: string[];
    }
}