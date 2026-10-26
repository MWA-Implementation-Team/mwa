import { ComponentChildren } from 'preact';
import { useContext } from 'preact/hooks';
import { ClientContext } from '#src/client/context.js';
import { Language, translate } from '#src/client/language.js';

export type TransProps = {
    id: keyof Language;
    values: Record<string, ComponentChildren>;
};

export function Trans({ id, values }: TransProps) {
    const { lang } = useContext(ClientContext);
    const template = translate(lang)(id);

    let parts: ComponentChildren[] = [];

    function addStr(str: string) {
        if (parts.length === 0 || typeof parts[parts.length - 1] !== 'string') {
            parts.push(str);
        } else {
            parts[parts.length - 1] += str;
        }
    }

    let keyBuf: string | null = null;
    for (const c of template) {
        if (keyBuf !== null) {
            if (c !== '}') {
                keyBuf += c;
                continue;
            }

            if (!Object.hasOwn(values, keyBuf)) {
                addStr(`{${keyBuf}}`);
                keyBuf = null;
                continue;
            }

            parts.push(values[keyBuf]);
            keyBuf = null;
            continue;
        }

        if (c === '{') {
            keyBuf = '';
            continue;
        }
        addStr(c);
    }

    if (keyBuf !== null) {
        addStr(`{${keyBuf}`);
    }

    return <>{parts}</>;
}
