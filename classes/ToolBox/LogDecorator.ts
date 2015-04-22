module ClassRegistry.ToolBox {

    export class LogDecorator {
        /**
         * Safely adds the given line to the console using console.debug.
         *
         * This is required because angular's $log service is not yet available
         * during bootstrap.
         * @param line
         */
        static debug(line: string) {
            if (console) {
                if (console.debug) {
                    console.debug(line);
                } else {
                    console.log(line);
                }
            }
        }
    }
}