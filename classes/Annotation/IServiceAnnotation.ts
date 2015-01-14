/// <reference path="./IClassAnnotation" />

module ClassRegistry.Annotation {

    export interface IServiceAnnotation extends IClassAnnotation {
        serviceName:         string;
    }

}