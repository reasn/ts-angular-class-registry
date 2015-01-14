/// <reference path="./IClassAnnotation" />

module ClassRegistry.Annotation {

    export interface IDirectiveAnnotation extends IClassAnnotation {
        directiveName:         string;
        directiveRegistration: any;
    }
}