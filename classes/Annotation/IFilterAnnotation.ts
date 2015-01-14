/// <reference path="./IClassAnnotation" />

module ClassRegistry.Annotation {

    export interface IFilterAnnotation extends IClassAnnotation {
        filterName: string;
    }

}