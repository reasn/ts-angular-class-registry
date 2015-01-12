/// <reference path="./IController" />
/// <reference path="./IDirective" />
/// <reference path="./IServiceRegistration" />
/// <reference path="./IDirectiveRegistration" />
/// <reference path="./IControllerRegistration" />

module ClassRegistry {

    interface IInjectableFunction {
        (...arguments: any[]): any;
        $inject?: string[];
    }

    export class Collector {

        private static instance: Collector;

        private serviceRegistrations: IServiceRegistration[] = [];
        private directiveRegistrations: IDirectiveRegistration[] = [];
        private controllerRegistrations: IControllerRegistration[] = [];

        static getInstance(): Collector {
            if (!Collector.instance) {
                Collector.instance = new Collector();
            }
            return Collector.instance;
        }

        static registerService(staticClass: Function, serviceName: string, namespace: string, dependencies: string[]): IServiceRegistration {
            var registration = {
                staticClass:  <IWrappableClass>staticClass,
                name:         serviceName,
                namespace:    namespace,
                dependencies: dependencies
            };
            Collector.checkRegistration(registration);
            this.getInstance().serviceRegistrations.push(registration);
            return registration;
        }

        static registerDirective(staticClass: Function, directiveName: string, namespace: string, directiveRegistrationData: any, dependencies: string[]): IDirectiveRegistration {
            var registration = {
                staticClass:  <IWrappableClass>staticClass,
                name:         directiveName,
                namespace:    namespace,
                registration: directiveRegistrationData,
                dependencies: dependencies
            };
            Collector.checkRegistration(registration);
            this.getInstance().directiveRegistrations.push(registration);
            return registration;
        }

        static registerController(staticClass: Function, namespace: string, dependencies: string[]): IControllerRegistration {

            var registration = {
                staticClass:  <IWrappableClass>staticClass,
                namespace:    namespace,
                dependencies: dependencies
            };
            Collector.checkRegistration(registration);
            this.getInstance().controllerRegistrations.push(registration);
            return registration;
        }

        private static checkRegistration(registration: IRegistration) {
            if (registration.staticClass) {
                throw new Error('Tried to register ' + registration.namespace + ' with an undefined class');
            }
            if (registration.staticClass.__registration.staticClass !== registration.staticClass) {
                throw new Error(registration.namespace + ' did not register itself via the ClassRegistry. Check for typos in registration!');
            }
        }

        wrapAndRegister(angularModule: ng.IModule) {
            this.serviceRegistrations.forEach((reg: IServiceRegistration)=> {
                angularModule.service(reg.name,
                    this.wrapService(reg.staticClass, reg.dependencies)
                );
            });
            this.directiveRegistrations.forEach((reg: IDirectiveRegistration)=> {
                angularModule.directive(reg.name,
                    this.wrapDirective(reg.staticClass, reg.registration, reg.dependencies)
                );
            });

            this.controllerRegistrations.forEach((reg: IControllerRegistration)=> {
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
                    dependencies: {[name:string]:any} = {},
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