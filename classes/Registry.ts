/// <reference path="./ClassWrapper" />
/// <reference path="./IWrappableClass" />
/// <reference path="./Annotation/IClassAnnotation" />
/// <reference path="./Annotation/IFilterAnnotation" />
/// <reference path="./Annotation/IServiceAnnotation" />
/// <reference path="./Annotation/IDirectiveRegistration" />
/// <reference path="./Annotation/IControllerRegistration" />

module ClassRegistry {
    export class Registry {

        static registerNamespace(namespace: any, angularModule: ng.IModule) {

            var i: any,
                annotation: Annotation.IClassAnnotation,
                allClasses = Registry.findAnnotatedClasses(namespace);

            for (i in allClasses) {
                if (allClasses.hasOwnProperty(i)) {
                    annotation = allClasses[i].__annotation;

                    switch (allClasses[i].__annotation.type) {

                        case ClassType.SERVICE:
                            angularModule.service((<Annotation.IServiceAnnotation>annotation).serviceName, ClassWrapper.wrapService(
                                allClasses[i],
                                annotation.dependencies
                            ));
                            //ToolBox.LogDecorator.debug('Registered ' + (<Annotation.IServiceAnnotation>annotation).serviceName + ' as ' + annotation.namespace);
                            break;

                        case ClassType.CONTROLLER:
                            angularModule.controller(annotation.namespace,
                                ClassWrapper.wrapController(
                                    allClasses[i],
                                    annotation.dependencies
                                )
                            );
                            //ToolBox.LogDecorator.debug('Registered ' + annotation.namespace);
                            break;

                        case ClassType.DIRECTIVE:
                            angularModule.directive((<Annotation.IDirectiveAnnotation>annotation).directiveName, ClassWrapper.wrapDirective(
                                allClasses[i],
                                (<Annotation.IDirectiveAnnotation>annotation).directiveRegistration,
                                annotation.dependencies
                            ));
                            //ToolBox.LogDecorator.debug('Registered ' + (<Annotation.IDirectiveAnnotation>annotation).directiveName + ' as ' + annotation.namespace);
                            break;

                        case ClassType.FILTER:
                            angularModule.filter((<Annotation.IFilterAnnotation>annotation).filterName, ClassWrapper.wrapFilter(
                                allClasses[i],
                                annotation.dependencies
                            ));
                            //ToolBox.LogDecorator.debug('Registered ' + (<Annotation.IFilterAnnotation>annotation).filterName + ' as ' + annotation.namespace);
                            break;

                        default:
                            throw Error('Found class with __annotation property that has is missing an __annotation.type property.');
                    }
                }
            }
        }

        private static findAnnotatedClasses(root: any): IWrappableClass[] {
            var foundElements: IWrappableClass[] = [];
            angular.forEach(root, function (child, key: string) {
                if (typeof key === 'string' && !key.substr(0, 1).match(/[A-Z]{1}/)) {
                    return;
                }
                if (typeof child === 'object' || typeof child === 'function') {
                    foundElements = foundElements.concat(Registry.findAnnotatedClasses(child));
                }
                if (child.__annotation) {
                    foundElements.push(child);
                }

            });
            return foundElements;
        }
    }
}