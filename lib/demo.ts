import { createParameterDecorator } from "./defs";

const Demo = createParameterDecorator<string | { title: string }, { title: string }>(``)

export class DemoMethod {

    onDemo(
        @Demo(`1111`)
        demo: string
    ) { }
}

const demo = new Demo({ title: 'ddd' })

debugger;