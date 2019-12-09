# `@nger/decorator`

> 一款简单的自定义装饰器工具

```ts
import { createClassDecorator } from '@nger/decorator';
export const CommandMetadataKey = `CommandMetadataKey`;
export interface CommandOptions {
    name: string;
    alias?: string;
    desc?: string;
    opts?: {
        noHelp?: boolean;
        isDefault?: boolean;
    };
}
export const Command = createClassDecorator<CommandOptions>(CommandMetadataKey, (target: any) => {
    return {
        name: target.name
    }
});
```