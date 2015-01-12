/// <reference path="./IController" />
/// <reference path="./IDirective" />

module ClassRegistry {

    interface IInjectableFunction {
        (...arguments: any[]): any;
        $inject?: string[];
    }

    interface ServiceRegistration {
        staticClass:  Function;
        name:         string;
        namespace:    string;
        dependencies: string[];
    }

    interface DirectiveRegistration {
        staticClass:  Function;
        name:         string;
        namespace:    string;
        registration: any;
        dependencies: string[];
    }

    interface ControllerRegistration {
        staticClass:  Function;
        namespace:    string;
        dependencies: string[];
    }

    export class Collector {

        private static instance: Collector;

        private serviceRegistrations: ServiceRegistration[] = [];
        private directiveRegistrations: DirectiveRegistration[] = [];
        private controllerRegistrations: ControllerRegistration[] = [];

        static getInstance(): Collector {
            if (!Collector.instance) {
                Collector.instance = new Collector();
            }
            return Collector.instance;
        }

        static registerService(staticClass: Function, serviceName: string, namespace: string, dependencies: string[]) {
            this.getInstance().serviceRegistrations.push({
                staticClass:  staticClass,
                name:         serviceName,
                namespace:    namespace,
                dependencies: dependencies
            });
        }

        static registerDirective(staticClass: Function, directiveName: string, namespace: string, registration: any, dependencies: string[]) {
            this.getInstance().directiveRegistrations.push({
                staticClass:  staticClass,
                name:         directiveName,
                namespace:    namespace,
                registration: registration,
                dependencies: dependencies
            });
        }

        static registerController(staticClass: Function, namespace: string, dependencies: string[]) {
            if (!staticClass) {
                throw new Error('Tried to register ' + namespace + ' with an undefined class');
            }
            this.getInstance().controllerRegistrations.push({
                staticClass:  staticClass,
                namespace:    namespace,
                dependencies: dependencies
            });
        }

        wrapAndRegister(angularModule: ng.IModule) {
            this.serviceRegistrations.forEach((reg: ServiceRegistration)=> {
                angularModule.service(reg.name,
                    this.wrapService(reg.staticClass, reg.dependencies)
                );
            });
            this.directiveRegistrations.forEach((reg: DirectiveRegistration)=> {
                angularModule.directive(reg.name,
                    this.wrapDirective(reg.staticClass, reg.registration, reg.dependencies)
                );
            });

            this.controllerRegistrations.forEach((reg: ControllerRegistration)=> {
                angularModule.controller(reg.namespace,
                    this.wrapController(reg.staticClass, reg.dependencies)
                );
            });
        }

        /**
         * Wraps a service.
         */
        private wrapService(Class: any, dependencies: string[]): IInjectableFunction {

            var wrappingFunction: IInjectableFunction = function () {
                var args = arguments,
                    service: any = new Class();

                angular.forEach(dependencies, function (dependencyName: string, i: number) {
                    service[dependencyName] = args[i];
                });
                return service;
            };
            wrappingFunction.$inject = dependencies;
            return wrappingFunction;
        }

        /**
         * Wraps a controller
         * When angular calls the wrapped function the render() method
         * of the given controller class will be rendered.
         */
        private wrapController(Class: any, dependencies: string[]): IInjectableFunction {

            var wrappingFunction: IInjectableFunction = function (): void {
                var args = arguments,
                    controller: IController = new Class();

                angular.forEach(dependencies, function (dependencyName: string, i: number) {
                    controller[dependencyName] = args[i];
                });

                //It's a controller - invoke the render method
                controller.render();
            };
            wrappingFunction.$inject = dependencies;
            return wrappingFunction;
        }

        /**
         * Wraps a directive.
         * As pointed out on several occasions by the angular team their current
         * directive notation system sucks. Therefore this wrapper is slightly
         * more complicated :/
         */
        private wrapDirective(Class: any, registration: any, dependencyNames: string[]): ng.IDirectiveFactory {

            var directiveFactory: IInjectableFunction = function (): ng.IDirective {
                var args = arguments,
                    dependencies = [],
                    angularDirective: any = registration;

                dependencyNames.forEach(function (dependencyName: string, i: number) {
                    dependencies[dependencyName] = args[i];
                });

                angularDirective.link = function ($scope, $element, $attrs) {
                    var directiveInstance: IDirective = new Class();
                    angular.extend(directiveInstance, dependencies);

                    directiveInstance.$scope = $scope;
                    directiveInstance.$element = $element;
                    directiveInstance.$attrs = $attrs;
                    directiveInstance.link();
                };
                return angularDirective;
            };
            directiveFactory.$inject = dependencyNames;
            return directiveFactory;
        }
    }
}