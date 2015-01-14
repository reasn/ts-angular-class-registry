/// <reference path="./IController" />
/// <reference path="./IDirective" />
/// <reference path="./Annotation/IServiceAnnotation" />
/// <reference path="./Annotation/IDirectiveRegistration" />
/// <reference path="./Annotation/IControllerRegistration" />

module ClassRegistry {

    export enum ClassType {
        SERVICE,
        CONTROLLER,
        DIRECTIVE
    }
}