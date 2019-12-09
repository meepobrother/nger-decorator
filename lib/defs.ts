import { getDesignType, getDesignParamTypes, getDesignReturnType, getDesignTargetParams } from "./util";
import { clsStore } from "./store";
const nger = Symbol.for(`__nger__decorator__`);
export type TypeProperty = string | symbol;
interface ClassOptions<T, O> {
    (target: Type<T>): O;
}
interface PropertyOptions<T, O> {
    (target: Type<T>, instance: T, property: TypeProperty, propertyType: any): O;
}
interface ParameterOptions<T, O> {
    (target: Type<T>, instance: T, property: TypeProperty | undefined, parameterIndex: number): O;
}
interface MethodOptions<T, O> {
    (target: Type<T>, instance: T, property: TypeProperty, descriptor: TypedPropertyDescriptor<any>): O
}
export type GetOptions<T = any, O = any> = ClassOptions<T, O> | PropertyOptions<T, O> | ParameterOptions<T, O> | MethodOptions<T, O>;
export interface Type<T> extends Function {
    new(...args: any[]): T;
}
export class INgerDecorator<T = any, O = any> {
    private _classes: Set<IClassDecorator> = new Set();
    private _properties: Set<IPropertyDecorator> = new Set();
    private _constructors: Set<IConstructorDecorator> = new Set();
    private _methods: Set<IMethodDecorator> = new Set();
    get classes() {
        return [...this._classes];
    }
    get methods() {
        return [...this._methods];
    }
    get properties() {
        return [...this._properties];
    }
    get constructors() {
        return [...this._constructors];
    }
    constructor() { }
    addClass(type: Type<T>, options: O, metadataKey: string, params: any[]) {
        this._classes.add(new IClassDecorator(type, options, metadataKey, params))
    }
    addProperty(
        property: TypeProperty,
        instance: T,
        type: Type<T>,
        options: any,
        propertyType: any,
        metadataKey: string
    ) {
        this._properties.add(new IPropertyDecorator(property, instance, type, options, propertyType, metadataKey));
    }
    addConstructor(type: Type<T>, parameterIndex: number, options: any, parameterTypes: any[], metadataKey: string) {
        this._constructors.add(new IConstructorDecorator(type, parameterIndex, options, parameterTypes, metadataKey));
    }
    addMethod(
        property: TypeProperty,
        instance: T,
        type: Type<T>,
        descriptor: TypedPropertyDescriptor<any>,
        options: any,
        returnType: any,
        paramTypes: any[],
        metadataKey: string
    ) {
        const method = this.__getMethod(property, instance, type, metadataKey);
        method.setDescriptor(descriptor);
        method.setReturnType(returnType);
        method.setParamTypes(paramTypes);
        method.setOptions(options);
    }
    addMethodParameter(instance: T, type: Type<T>, property: TypeProperty, parameterIndex: number, options: any, parameterTypes: any, metadataKey: string) {
        const method = this.__getMethod(property, instance, type, metadataKey)
        method.addParameter(instance, type, property, parameterIndex, options, parameterTypes, metadataKey)
    }
    private __getMethod(property: TypeProperty, instance: T, type: Type<T>, metadataKey: string): IMethodDecorator {
        let method = [...this._methods].find(it => it.property === property);
        if (method) return method;
        method = new IMethodDecorator(property, instance, type, undefined, metadataKey)
        this._methods.add(method);
        return method;
    }
}
export class IClassDecorator<T = any, O = any> {
    private _type: Type<T>;
    private _options: O;
    private _metadataKey: string;
    private _params: any[];
    get options(): O {
        return { ...this._options };
    }
    get type() {
        return this._type;
    }
    get metadataKey() {
        return this._metadataKey;
    }
    get parameters() {
        return this._params;
    }
    constructor(type: Type<T>, options: O, metadataKey: string, params: any) {
        this._type = type;
        this._options = options;
        this._metadataKey = metadataKey;
        this._params = params;
    }
}
export class IConstructorDecorator<T = any, O = any>{
    private _type: Type<T>;
    private _options: O;
    private _parameterIndex: number;
    private _parameterTypes: any[];
    private _parameterType: any;
    get type() {
        return this._type;
    }
    get options() {
        return this._options;
    }
    get parameterIndex() {
        return this._parameterIndex;
    }
    get parameterType() {
        return this._parameterType || this._parameterTypes[this.parameterIndex]
    }
    private _metadataKey: string;
    get metadataKey() {
        return this._metadataKey;
    }
    constructor(type: Type<T>, parameterIndex: number, options: O, parameterTypes: any[], metadataKey: string) {
        this._type = type;
        this._parameterIndex = parameterIndex;
        this._options = options;
        this._parameterTypes = parameterTypes;
        this._metadataKey = metadataKey;
    }
    setParamterType(type: any) {
        this._parameterType = type;
    }
}
export class IParameterDecorator<T = any, O = any> {
    private _instance: T;
    private _type: Type<T>;
    private _property: string | symbol;
    private _parameterIndex: number;
    private _options: O;
    private _parameterTypes: any[];
    get instance() {
        return this._instance;
    }
    get type() {
        return this._type;
    }
    get property() {
        return this._property;
    }
    get parameterIndex() {
        return this._parameterIndex;
    }
    get options() {
        return this._options;
    }
    get parameterType() {
        return this._parameterTypes[this.parameterIndex];
    }
    private _metadataKey: string;
    get metadataKey() {
        return this._metadataKey;
    }
    constructor(instance: T, type: Type<T>, property: TypeProperty, parameterIndex: number, options: O, parameterTypes: any[], metadataKey: string) {
        this._instance = instance;
        this._type = type;
        this._property = property;
        this._parameterIndex = parameterIndex;
        this._options = options;
        this._parameterTypes = parameterTypes;
        this._metadataKey = metadataKey;
    }
}
export class IPropertyDecorator<T = any, O = any> {
    private _property: string | symbol;
    private _instance: T;
    private _type: Type<T>;
    private _options: O;
    private _propertyType: any;
    get property() {
        return this._property;
    }
    get instance() {
        return this._instance;
    }
    get type() {
        return this._type;
    }
    get options() {
        return this._options;
    }
    get propertyType() {
        return this._propertyType;
    }
    private _metadataKey: string;
    get metadataKey() {
        return this._metadataKey;
    }
    constructor(
        property: TypeProperty,
        instance: T,
        type: Type<T>,
        options: O,
        propertyType: any,
        metadataKey: string
    ) {
        this._property = property;
        this._instance = instance;
        this._type = type;
        this._options = options;
        this._propertyType = propertyType;
        this._metadataKey = metadataKey;
    }
}
export class IMethodDecorator<T = any, O = any> {
    private _property: TypeProperty;
    private _instance: T;
    private _type: Type<T>;
    private _descriptor: TypedPropertyDescriptor<any> | undefined;
    private _options: O;
    private _parameters: Set<IParameterDecorator> = new Set();
    private _returnType: any;
    private _paramTypes: any[];
    get returnType() {
        return this._returnType;
    }
    get paramTypes() {
        return this._paramTypes;
    }
    get parameters() {
        return [...this._parameters];
    }
    get options() {
        return this._options;
    }
    get descriptor() {
        return this._descriptor;
    }
    get type() {
        return this._type;
    }
    get instance() {
        return this._instance;
    }
    get property() {
        return this._property;
    }
    private _metadataKey: string;
    get metadataKey() {
        return this._metadataKey;
    }
    constructor(
        property: string | symbol,
        instance: T,
        type: Type<T>,
        descriptor: TypedPropertyDescriptor<any> | undefined,
        metadataKey: string
    ) {
        this._property = property;
        this._instance = instance;
        this._type = type;
        this._descriptor = descriptor;
        this._metadataKey = metadataKey;
    }

    setDescriptor(descriptor: TypedPropertyDescriptor<any>) {
        this._descriptor = descriptor;
    }

    setReturnType(returnType: any) {
        this._returnType = returnType;
    }

    setParamTypes(paramTypes: any[]) {
        this._paramTypes = paramTypes;
    }

    setOptions(options: O) {
        this._options = options;
    }

    addParameter(instance: T, type: Type<T>, property: TypeProperty, parameterIndex: number, options: any, parameterTypes: any[], metadataKey: string) {
        this._parameters.add(new IParameterDecorator(instance, type, property, parameterIndex, options, parameterTypes, metadataKey));
    }
}
export function getINgerDecorator<T = any, O = any>(type: Type<T>): INgerDecorator<T, O> {
    if (!Reflect.has(type, nger)) {
        const value = new INgerDecorator();
        Reflect.defineProperty(type, nger, {
            value
        });
    }
    return Reflect.get(type, nger);
}
export function isGetOptions(val: any): val is GetOptions {
    return typeof val === 'function';
}
interface ParameterCallBack<O = any> {
    (options: O, target: any, instance: any, property: TypeProperty | undefined, parameterIndex: number): void;
}
export function createParameterDecorator<O = any>(
    metadataKey: string,
    defOptions?: ParameterOptions<any, O>,
    callback?: ParameterCallBack<O>
): (opt?: O) => ParameterDecorator {
    return (opts?: O): ParameterDecorator => {
        return (target: any, property: TypeProperty | undefined, parameterIndex: number) => {
            let parameterTypes = [];
            if (property) {
                parameterTypes = getDesignParamTypes(target, property) || [];
            } else {
                parameterTypes = getDesignTargetParams(target) || [];
            }
            // 如果property=undefined,说明是constructor,target是Class
            // 否则property是方法名, target是Class的instance
            let type = target.constructor;
            const instance = target;
            if (!property) {
                type = target;
            }
            let options: any = opts;
            if (defOptions) {
                options = {
                    ...defOptions(type, instance, property, parameterIndex),
                    ...opts
                };
            }
            const classDecorator = getINgerDecorator(type);
            if (!property) {
                classDecorator.addConstructor(type, parameterIndex, options, parameterTypes, metadataKey);
            } else {
                classDecorator.addMethodParameter(instance, type, property, parameterIndex, options, parameterTypes, metadataKey);
            }
            callback && callback(options, target, instance, property, parameterIndex);
        }
    }
}
interface PropertyCallBack<O = any> {
    (options: O, target: any, instance: any, property: TypeProperty): void;
}
export function createPropertyDecorator<O = any>(
    metadataKey: string,
    defOptions?: PropertyOptions<any, O>,
    callback?: PropertyCallBack
): (opt?: O) => PropertyDecorator {
    return (opts?: O): PropertyDecorator => {
        return (target: any, property: TypeProperty) => {
            // target是Class的instance
            const propertyType = getDesignType(target, property)
            const type = target.constructor;
            const instance = target;
            let options = opts;
            if (defOptions) {
                options = {
                    ...defOptions(type, instance, property, propertyType),
                    ...opts
                };
            }
            const classDecorator = getINgerDecorator(type);
            classDecorator.addProperty(property, instance, type, options, propertyType, metadataKey)
            callback && callback(options, target, instance, property)
        }
    }
}
interface MethodCallBack<O = any> {
    (options: O, target: any, instance: any): void;
}
export function createMethodDecorator<O = any>(
    metadataKey: string,
    defOptions?: MethodOptions<any, O>,
    callback?: MethodCallBack<O>
): (opt?: O) => MethodDecorator {
    return (opts?: O): MethodDecorator => {
        return (target: any, property: TypeProperty, descriptor: TypedPropertyDescriptor<any>) => {
            // target是Class的instance
            const returnType = getDesignReturnType(target, property)
            const paramTypes = getDesignParamTypes(target, property) || [];
            const type = target.constructor;
            const instance = target;
            let options: any = opts;
            if (defOptions) {
                options = {
                    ...defOptions(type, instance, property, descriptor),
                    ...opts
                };
            }
            const classDecorator = getINgerDecorator(type);
            classDecorator.addMethod(property, instance, type, descriptor, options, returnType, paramTypes, metadataKey)
            callback && callback(options, target, instance);
        }
    }
}
interface ClassCallBack<O = any> {
    (options: O, target: any): void;
}
export function createClassDecorator<O>(
    metadataKey: string,
    defOptions?: ClassOptions<any, O>,
    callback?: ClassCallBack<O>
): (opts?: O) => ClassDecorator {
    return (opts?: O): ClassDecorator => {
        return (target: any) => {
            // target是class
            const type = target;
            let options: any = opts;
            if (defOptions) {
                options = {
                    ...defOptions(type),
                    ...opts
                };
            }
            const params = getDesignTargetParams(target) || []
            const classDecorator = getINgerDecorator(type);
            classDecorator.addClass(type, options, metadataKey, params);
            clsStore.set(metadataKey, type);
            callback && callback(options, target)
            return target;
        }
    }
}
type CallBack<O> = ClassCallBack<O> | PropertyCallBack<O> | MethodCallBack<O> | ParameterCallBack<O>;
export function createDecorator<O>(
    metadataKey: string,
    defOptions?: O | GetOptions<any, O>,
    callback?: CallBack<O>
): (opts?: O) => any {
    return (opt?: O) => (target: any, property: any, descriptor: any) => {
        if (property) {
            if (typeof descriptor === 'undefined') {
                return createPropertyDecorator(metadataKey, defOptions as PropertyOptions<any, O>, callback as any)(opt)(target, property);
            } else if (typeof descriptor === 'number') {
                return createParameterDecorator(metadataKey, defOptions as ParameterOptions<any, O>, callback as any)(opt)(target, property, descriptor);
            } else {
                return createMethodDecorator(metadataKey, defOptions as MethodOptions<any, O>, callback as any)(opt)(target, property, descriptor);
            }
        } else {
            if (typeof descriptor === 'number') {
                return createParameterDecorator(metadataKey, defOptions as ParameterOptions<any, O>, callback as any)(opt)(target, property, descriptor)
            }
            return createClassDecorator(metadataKey, defOptions as ClassOptions<any, O>, callback as any)(opt)(target);
        }
    }
}
