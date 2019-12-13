import { getDesignType, getDesignParamTypes, getDesignReturnType, getDesignTargetParams } from "./util";
import { clsStore } from "./store";
const nger = Symbol.for(`__nger__decorator__`);
export type TypeProperty = string | symbol;
type CallHanlder<O> = ClassHanlder<O> | PropertyHandler<O> | MethodHandler<O> | ParameterHandler<O>;
let _globalAfterHandlers: Map<string, CallHanlder<any>> = new Map();
let _globalBeforeHandlers: Map<string, CallHanlder<any>> = new Map();
export function setGlobalBeforeHandlers(handlers: Map<string, CallHanlder<any>>) {
    _globalBeforeHandlers = handlers;
}
export function setGlobalAfterHandlers(handlers: Map<string, CallHanlder<any>>) {
    _globalAfterHandlers = handlers;
}
function getGlobalBeforeHanderAndCall(key: string, item: any) {
    const handler = _globalBeforeHandlers.get(key);
    if (handler) handler(item);
}
function getGlobalAfterHanderAndCall(key: string, item: any) {
    const handler = _globalAfterHandlers.get(key);
    if (handler) handler(item);
}
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
    addClass(item: IClassDecorator) {
        this._classes.add(item)
    }
    addProperty(
        item: IPropertyDecorator
    ) {
        this._properties.add(item);
    }
    addConstructor(item: IConstructorDecorator) {
        this._constructors.add(item);
    }
    addMethod(
        item: IMethodDecorator
    ) {
        const method = this.__getMethod(item.property, item.instance, item.type, item.metadataKey);
        method.setDescriptor(item.descriptor);
        method.setReturnType(item.returnType);
        method.setParamTypes(item.paramTypes);
        method.setOptions(item.options);
    }
    addMethodParameter(item: IParameterDecorator) {
        const method = this.__getMethod(item.property, item.instance, item.type, item.metadataKey)
        return method.addParameter(item)
    }
    private __getMethod(property: TypeProperty, instance: T, type: Type<T>, metadataKey: string): IMethodDecorator {
        let method = [...this._methods].find(it => it.property === property);
        if (method) return method;
        method = new IMethodDecorator(property, instance, type, undefined, undefined, undefined, undefined, metadataKey)
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
    private _options: O | undefined;
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
    private _metadataKey: string | undefined;
    get metadataKey() {
        return this._metadataKey;
    }
    constructor(
        property: TypeProperty,
        instance: T,
        type: Type<T>,
        options?: O,
        propertyType?: any,
        metadataKey?: string
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
        options: O,
        returnType: any,
        paramTypes: any,
        metadataKey: string
    ) {
        this._property = property;
        this._instance = instance;
        this._type = type;
        this._descriptor = descriptor;
        this._metadataKey = metadataKey;
        this._options = options;
        this._returnType = returnType;
        this._paramTypes = paramTypes;
    }

    setDescriptor(descriptor: TypedPropertyDescriptor<any> | undefined) {
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

    addParameter(item: IParameterDecorator) {
        this._parameters.add(item);
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
interface ParameterHandler<O = any> {
    (arg: IConstructorDecorator<any, O> | IParameterDecorator<any, O>): void;
}
export function createParameterDecorator<O = any>(
    metadataKey: string,
    beforeHandler?: ParameterHandler<O>,
    afterHandler?: ParameterHandler<O>
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
            const classDecorator = getINgerDecorator(type);
            if (!property) {
                const item = new IConstructorDecorator(type, parameterIndex, options, parameterTypes, metadataKey);
                if (beforeHandler) beforeHandler(item);
                getGlobalBeforeHanderAndCall(metadataKey, item)
                classDecorator.addConstructor(item);
                if (afterHandler) afterHandler(item);
                getGlobalAfterHanderAndCall(metadataKey, item)
            } else {
                const item = new IParameterDecorator(instance, type, property, parameterIndex, options, parameterTypes, metadataKey);
                beforeHandler && beforeHandler(item);
                getGlobalBeforeHanderAndCall(metadataKey, item)
                classDecorator.addMethodParameter(item);
                afterHandler && afterHandler(item);
                getGlobalAfterHanderAndCall(metadataKey, item)
            }
        }
    }
}
interface PropertyHandler<O = any> {
    (item: IPropertyDecorator<any, O>): void;
}
export function createPropertyDecorator<O = any>(
    metadataKey: string,
    beforeHandler?: PropertyHandler<O>,
    afterHandler?: PropertyHandler
): (opt?: O) => PropertyDecorator {
    return (opts?: O): PropertyDecorator => {
        return (target: any, property: TypeProperty) => {
            // target是Class的instance
            const propertyType = getDesignType(target, property)
            const type = target.constructor;
            const instance = target;
            const classDecorator = getINgerDecorator(type);
            const item = new IPropertyDecorator<any, O>(property, instance, type, opts, propertyType, metadataKey);
            beforeHandler && beforeHandler(item)
            getGlobalBeforeHanderAndCall(metadataKey, item)
            classDecorator.addProperty(item)
            afterHandler && afterHandler(item)
            getGlobalAfterHanderAndCall(metadataKey, item)
        }
    }
}
interface MethodHandler<O = any> {
    (item: IMethodDecorator<any, O>): void;
}
export function createMethodDecorator<O = any>(
    metadataKey: string,
    beforeHandler?: MethodHandler<O>,
    afterHandler?: MethodHandler<O>
): (opt?: O) => MethodDecorator {
    return (opts?: O): MethodDecorator => {
        return (target: any, property: TypeProperty, descriptor: TypedPropertyDescriptor<any>) => {
            // target是Class的instance
            const returnType = getDesignReturnType(target, property)
            const paramTypes = getDesignParamTypes(target, property) || [];
            const type = target.constructor;
            const instance = target;
            let options: any = opts;
            const classDecorator = getINgerDecorator(type);
            const item = new IMethodDecorator(property, instance, type, descriptor, options, returnType, paramTypes, metadataKey)
            beforeHandler && beforeHandler(item);
            getGlobalBeforeHanderAndCall(metadataKey, item)
            classDecorator.addMethod(item)
            afterHandler && afterHandler(item);
            getGlobalAfterHanderAndCall(metadataKey, item)
        }
    }
}
interface ClassHanlder<O = any> {
    (item: IClassDecorator<any, O>): void;
}
export function createClassDecorator<O>(
    metadataKey: string,
    beforeHandler?: ClassHanlder<O>,
    afterHandler?: ClassHanlder<O>
): (opts?: O) => ClassDecorator {
    return (opts?: O): ClassDecorator => {
        return (target: any) => {
            // target是class
            const type = target;
            let options: any = opts;
            const params = getDesignTargetParams(target) || []
            const classDecorator = getINgerDecorator(type);
            const item = new IClassDecorator(type, options, metadataKey, params);
            beforeHandler && beforeHandler(item);
            // before 钩子
            getGlobalBeforeHanderAndCall(metadataKey, item)
            classDecorator.addClass(item);
            clsStore.set(metadataKey, type);
            afterHandler && afterHandler(item);
            getGlobalAfterHanderAndCall(metadataKey, item)
        }
    }
}
export function createDecorator<O>(
    metadataKey: string,
    beforeHandler?: CallHanlder<O>,
    afterHandler?: CallHanlder<O>
): (opts?: O) => any {
    return (opt?: O) => (target: any, property: any, descriptor: any) => {
        if (property) {
            if (typeof descriptor === 'undefined') {
                return createPropertyDecorator(metadataKey, beforeHandler as any, afterHandler as any)(opt)(target, property);
            } else if (typeof descriptor === 'number') {
                return createParameterDecorator(metadataKey, beforeHandler as any, afterHandler as any)(opt)(target, property, descriptor);
            } else {
                return createMethodDecorator(metadataKey, beforeHandler as any, afterHandler as any)(opt)(target, property, descriptor);
            }
        } else {
            if (typeof descriptor === 'number') {
                return createParameterDecorator(metadataKey, beforeHandler as any, afterHandler as any)(opt)(target, property, descriptor)
            }
            return createClassDecorator(metadataKey, beforeHandler as any, afterHandler as any)(opt)(target);
        }
    }
}
