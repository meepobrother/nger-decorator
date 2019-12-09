import { Type } from "./defs";

export class DecoratorStore {
    map: Map<string, Set<any>> = new Map();
    set<T = any>(metadataKey: string, val: Type<T>) {
        const allTypes = this.get(metadataKey)
        allTypes.add(val);
        this.map.set(metadataKey, allTypes);
    }

    get<T>(metadataKey: string): Set<T> {
        let allTypes = this.map.get(metadataKey);
        if (!allTypes) {
            allTypes = new Set();
        }
        return allTypes;
    }
}
export const clsStore = new DecoratorStore();
