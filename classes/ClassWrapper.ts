/// <reference path="./IInjectableFunction" />

module ClassRegistry {

    export class ClassWrapper {

        /**
         * Wraps a service.
         */
        static wrapService(Class: any, dependencies: string[]): IInjectableFunction {

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
        static wrapController(Class: any, dependencies: string[]): IInjectableFunction {

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
        static wrapDirective(Class: any, registration: any, dependencyNames: string[]): ng.IDirectiveFactory {

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