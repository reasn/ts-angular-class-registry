module ClassRegistry.Annotation {

    export interface IClassAnnotation {
        type: ClassRegistry.ClassType;
        namespace:    string;
        dependencies: string[];

    }
}