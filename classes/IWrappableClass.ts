/// <reference path="./Annotation/IClassAnnotation" />

module ClassRegistry {

    export interface IWrappableClass extends Function {
        __annotation: Annotation.IClassAnnotation;
    }
}