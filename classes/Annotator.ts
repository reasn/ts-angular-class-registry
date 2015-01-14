/// <reference path="./ClassType" />
/// <reference path="./Annotation/IClassAnnotation" />

module ClassRegistry {

    export class Annotator {
        static annotate<AnnotationType extends Annotation.IClassAnnotation>(annotation: AnnotationType): AnnotationType {
            return annotation;
        }
    }
}