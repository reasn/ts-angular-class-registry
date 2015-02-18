module ClassRegistry.ToolBox {

    export class LogDecorator {
        /**
         classWrapper.wrapAndRegisterDirective(this.appModule, SL.Directive.GenderOptions.GenderOptionsDirective);
         classWrapper.wrapAndRegisterController(this.appModule, SL.Controller.HeaderController);
         * Safely adds the given line to the console using console.debug.
         *
         * This is required because angular's $log service is not yet available
         * during bootstrap.
         * @param line
         */
        static debug(line: string) {
            if (console) {
                if (console.debug) {
                    console.debug(LogDecorator.getTimeString() + line);
                } else {
                    console.log(LogDecorator.getTimeString() + line);
                }
            }
        }

        private static getTimeString() {

            var now = new Date();
            try {
                return ('00' + now.getHours()).substr(-2, 2) +
                    ':' +
                    ('00' + now.getMinutes()).substr(-2, 2) +
                    ':' +
                    ('00' + now.getSeconds()).substr(-2, 2) +
                    (now.getMilliseconds() / 1000).toFixed(3).substr(1)
                    + ' - ';
            } catch (e) {
                //negative substring padding doesn't work in older IEs
                return '';
            }
        }

        /**
         * Decorates the log service so that the current timestamp is prepended to each entry.
         * @see http://en.wikipedia.org/wiki/Decorator_pattern
         * @see http://solutionoptimist.com/2013/10/07/enhance-angularjs-logging-using-decorators/
         */
        static decorateLogService(appModule: ng.IModule) {
            appModule.config(['$provide', ($provide: ng.auto.IProvideService) => {
                $provide.decorator('$log', ['$delegate', ($delegate: ng.ILogService) => {

                    angular.forEach(['debug', 'info', 'warn', 'error'], function (functionName: string) {
                        var original = $delegate[functionName];
                        $delegate[functionName] = function () {
                            var args = [].slice.call(arguments);

                            if (typeof args[0] === 'string' || typeof args[0] === 'number') {
                                //Don't prepend complex data types like objects
                                args[0] = LogDecorator.getTimeString() + args[0];
                            }

                            // Call the original with the output prepended with a formatted timestamp
                            original.apply($delegate, args)
                        };
                    });
                    return $delegate;
                }]);
            }]);
            LogDecorator.debug('  Log service decorated');
        }
    }
}