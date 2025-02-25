export enum blockType {
    PAGE = 'page',
    SECTION = 'section',
    COLUMN = 'column',
    GROUP = 'group',
    TEXT = 'text',
    HEADING = 'heading',
    IMAGE = 'image',
    DIVIDER = 'divider',
    SPACER = 'spacer',
    BUTTON = 'button',
    WRAPPER = 'wrapper',
    RAW = 'raw',
    QUERY = 'query',
    ACCORDION = 'accordion',
    ACCORDION_ELEMENT = 'accordion-element',
    ACCORDION_TITLE = 'accordion-title',
    ACCORDION_TEXT = 'accordion-text',
    HERO = 'hero',
    CAROUSEL = 'carousel',
    NAVBAR = 'navbar',
    SOCIAL = 'social',
    // TODO
    TABLE = 'table',
    TEMPLATE = 'template',
    QUERY_PATTERN = 'query-pattern',
}
export const DATA_RENDER_COUNT = 'data-render-count';
export const STORE_KEY = 'mailerpress';
export const EMAIL_BLOCK_CLASS_NAME = 'email-block';

export const notAvailableMJMLComponents = [
    'mj-accordion',
    'mj-carousel',
    'mj-hero',
    'mj-navbar',
    'mj-raw',
    'mj-social',
    'mj-table'
]

declare const jsVars: {
    placeholderImage: string;
};

export const PLACEHOLDER_IMAGE = jsVars.placeholderImage + '/img/placeholder-256x256.svg';

export const layout = [
    {
        label: '100',
        icon: `
         <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"
             aria-hidden="true" focusable="false">
            <path fill-rule="evenodd" clip-rule="evenodd"
                  d="m39.0625 14h-30.0625v20.0938h30.0625zm-30.0625-2c-1.10457 0-2 .8954-2 2v20.0938c0 1.1045.89543 2 2 2h30.0625c1.1046 0 2-.8955 2-2v-20.0938c0-1.1046-.8954-2-2-2z"></path>
        </svg>
        `,
        layout: ['']
    },
    {
        label: '50/50',
        icon: `
         <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"
             aria-hidden="true" focusable="false">
            <path fill-rule="evenodd" clip-rule="evenodd"
                  d="M39 12C40.1046 12 41 12.8954 41 14V34C41 35.1046 40.1046 36 39 36H9C7.89543 36 7 35.1046 7 34V14C7 12.8954 7.89543 12 9 12H39ZM39 34V14H25V34H39ZM23 34H9V14H23V34Z"></path>
        </svg>
        `,
        layout: ['50%', '50%']
    },
    {
        label: '33/66',
        icon: `
        <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"
             aria-hidden="true" focusable="false">
            <path fill-rule="evenodd" clip-rule="evenodd"
                  d="M39 12C40.1046 12 41 12.8954 41 14V34C41 35.1046 40.1046 36 39 36H9C7.89543 36 7 35.1046 7 34V14C7 12.8954 7.89543 12 9 12H39ZM39 34V14H20V34H39ZM18 34H9V14H18V34Z"></path>
        </svg>
        `,
        layout: ['33%', '66%']
    },
    {
        label: '66/33',
        icon: `
        <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"
             aria-hidden="true" focusable="false">
            <path fill-rule="evenodd" clip-rule="evenodd"
                  d="M39 12C40.1046 12 41 12.8954 41 14V34C41 35.1046 40.1046 36 39 36H9C7.89543 36 7 35.1046 7 34V14C7 12.8954 7.89543 12 9 12H39ZM39 34V14H30V34H39ZM28 34H9V14H28V34Z"></path>
        </svg>
        `,
        layout: ['66%', '33%']
    },
    {
        label: '33/33/33',
        icon: `
        <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"
                         aria-hidden="true" focusable="false">
                        <path fill-rule="evenodd"
                              d="M41 14a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v20a2 2 0 0 0 2 2h30a2 2 0 0 0 2-2V14zM28.5 34h-9V14h9v20zm2 0V14H39v20h-8.5zm-13 0H9V14h8.5v20z"></path>
                    </svg>
        `,
        layout: ['33%', '33%', '33%']
    },
    {
        label: '25/50/25',
        icon: `
         <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"
                         aria-hidden="true" focusable="false">
                        <path fill-rule="evenodd"
                              d="M41 14a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v20a2 2 0 0 0 2 2h30a2 2 0 0 0 2-2V14zM31 34H17V14h14v20zm2 0V14h6v20h-6zm-18 0H9V14h6v20z"></path>
                    </svg>
        `,
        layout: ['25%', '50%', '25%']
    },
];

