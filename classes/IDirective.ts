module ClassRegistry {

    export interface IDirective {
        $scope?: ng.IScope;
        $element?: ng.IRootElementService;
        $attrs?: ng.IAttributes;
        link(): void;
    }
}