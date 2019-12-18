import { TypeProperty } from "./defs";

function DecoratorFactory(this: any, opts?: any): ParameterDecorator {
    if (this instanceof DecoratorFactory) {
        (this as any).opts = opts;
        return this as any;
    }
    function Decorator(target: any, property: TypeProperty | undefined, parameterIndex: number) {

    }
    return Decorator;
}
DecoratorFactory.prototype.ngMetadataName = `demo`;
const test = new (DecoratorFactory as any)({ demo: `title` })

debugger;