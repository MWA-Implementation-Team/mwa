/** @type {import('stylelint').Config} */
export default {
    extends: ['stylelint-config-standard'],
    ignoreFiles: ['static/oat.css', 'dist/**', 'node_modules/**'],
    rules: {
        'declaration-no-important': true,
        'color-no-hex': true,
        'color-named': 'never',
        'function-disallowed-list': [
            'rgb',
            'rgba',
            'hsl',
            'hsla',
            'hwb',
            'lab',
            'lch',
            'oklab',
            'oklch',
            'color',
            'color-mix',
        ],
        'function-url-scheme-allowed-list': ['data'],
        'at-rule-disallowed-list': ['import'],
        'declaration-property-unit-disallowed-list': {
            'font-size': ['px'],
            '/^(padding|margin|gap|row-gap|column-gap)/': ['px'],
            'border-radius': ['px'],
        },
        'selector-disallowed-list': [
            /^\.mwa\s+(?!:where\()/,
            {
                message:
                    'Don\'t scope selectors under ".mwa " — app CSS is unlayered and already beats Oat',
            },
        ],
        'selector-max-id': 0,
        'selector-max-specificity': '0,3,1',
        'max-nesting-depth': 1,
        'selector-class-pattern': [
            '^[a-z][a-z0-9]*(-[a-z0-9]+)*(--[a-z0-9]+(-[a-z0-9]+)*)?$',
            {
                message:
                    'Use kebab-case block names with optional --modifier (e.g. mwa-note--error)',
            },
        ],
        'custom-property-pattern': [
            '^[a-z][a-z0-9]*(-[a-z0-9]+)*$',
            { message: 'Custom properties are kebab-case' },
        ],
        'alpha-value-notation': 'number',
        'media-feature-range-notation': 'prefix',
        'import-notation': 'string',
    },
    overrides: [
        {
            files: ['static/style/tokens.css'],
            rules: {
                'color-no-hex': null,
                'color-named': null,
                'function-disallowed-list': null,
            },
        },
        {
            files: ['static/style/main.css'],
            rules: { 'at-rule-disallowed-list': null },
        },
    ],
};
