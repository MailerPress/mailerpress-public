import BlockEditorState from "../interfaces/block-editor-state.ts";
import {
    duplicateBlockByClientId,
    findBlockInState,
    removeBlockByClientId
} from "../utils/block.ts";
import {
    ADD_COLUMN, CLEAR_DRAFT,
    DELETE_BLOCK, DELETE_PATTERN,
    DUPLICATE_BLOCK,
    EDIT_BLOCK,
    EDIT_PREVIEW_MODE,
    HOVER_BLOCK, INSTALL_FONT,
    REDO, REMOVE_FONT,
    REPLACE_CONTENT,
    SELECT_BLOCK,
    SET_BLOCK_DRAGGED,
    SET_BLOCKS, SET_DRAFT,
    SET_EDIT_MODE,
    SET_EMAIL_CONFIG, SET_FONT,
    SET_MODAL,
    SET_TABS,
    SET_THEME,
    TOGGLE_BLOCK_SIDEBAR,
    TOGGLE_SECONDARY_SIDEBAR,
    UNDO, UPDATE_PATTERNS_LIB,
} from "./actions.ts";
import BlockManager from "../core/BlockManager.ts";
import {blockType} from "../constants.ts";
import {v4 as uuidv4} from 'uuid';
import _, {cloneDeep} from "lodash";
import {deepMerge} from "../utils/style.ts";

const clientId = uuidv4()
const defautData = BlockManager.getBlockByType(blockType.PAGE).init({
    clientId: "page",
    children: []
});

const DEFAULT_STATE: BlockEditorState = {
    emailConfig: null,
    theme: window.jsVars.themeStyles['theme'],
    page: {
        mode: 'desktop',
    },
    sidebar: {
        blockDisplayed: true,
        secondarySidebarOpen: false,
        activeTab: 'document',
        blockEdited: null
    },
    blocks: {
        past: [],
        future: [],
        current: defautData,
        patternsCategories: jsVars.patternCategories,
        templatesCategories: jsVars.templateCategories,
        selected: {
            parent: null,
            block: findBlockInState(defautData, clientId)
        },
        hovered: null
    },
    blockDragged: null,
    modal: null,
    tabs: {
        blocks: 0,
        settings: 0,
    },
    patterns: BlockManager.getPatterns(),
    editMode: 'builder',
    draft: localStorage.getItem('mailerpress_editor_state') || '',
    fonts: {
        text: {
            selectedFont: 'Poppins',
            selectedVariant: '400'
        },
        button: {
            selectedFont: 'Roboto',
            selectedVariant: '400'
        },
        heading: {
            selectedFont: 'Oswald',
            selectedVariant: '700'
        },
    },
    fontsInstalled: {
        core: {
            'Montserrat': ['100', '400', '700', '900'],
            'Poppins': ['400', '700'],
            'Ubuntu': ['300', '500', '700'],
            'Roboto': ['400', '700'],
            'Oswald': ['700'],
        },
        installed: {...window.jsVars.editorFonts}
    }
    // fontsInstalled: {
    //     'Montserrat': ['100', '400', '700', '900'],
    //     'Poppins': ['400', '700'],
    //     'Roboto': ['400', '700'],
    //     'Oswald': ['700'],
    //     ...window.jsVars.editorFonts
    // },
}

export default function reducer(state = DEFAULT_STATE, action) {
    switch (action.type) {
        case REMOVE_FONT:
            return {
                ...state,
                fontsInstalled: {
                    ...state.fontsInstalled,
                    installed:  Object.entries(state.fontsInstalled.installed).filter(([key]) => key !== action.font)
                }
            };
        case INSTALL_FONT:
            return {
                ...state,
                fontsInstalled: {
                    ...state.fontsInstalled,
                    installed: {
                        ...state.fontsInstalled.installed,
                        ...action.font
                    }
                }
            };
        case SET_FONT:
            return {
                ...state,
                fonts: {
                    ...state.fonts,
                    [action.key]: {
                        selectedFont: action.selectedFont,
                        selectedVariant: action.selectedVariant
                    }
                }
            };
        case SET_DRAFT:
            return {...state, draft: action.draft};
        case CLEAR_DRAFT:
            return {...state, draft: ''};
        default:
            return state;
        case DELETE_PATTERN:
            return {
                ...state,
                patterns: state.patterns.filter(p => p.postId !== action.id)
            }
        case UPDATE_PATTERNS_LIB:
            return {
                ...state,
                patterns: [
                    ...state.patterns,
                    action.payload
                ]
            }
        case TOGGLE_BLOCK_SIDEBAR:
            return {
                ...state,
                sidebar: {
                    ...state.sidebar,
                    blockDisplayed: !state.sidebar.blockDisplayed
                }
            }
        case TOGGLE_SECONDARY_SIDEBAR:
            return {
                ...state,
                sidebar: {
                    ...state.sidebar,
                    secondarySidebarOpen: !state.sidebar.secondarySidebarOpen
                }
            }
        case SET_EMAIL_CONFIG:
            return {
                ...state,
                emailConfig: {
                    ...state.emailConfig,
                    ...action.config
                }
            }

        case SET_THEME:
            return {
                ...state,
                theme: window.jsVars.themeStyles[action.name],

            }
        case SET_BLOCKS:
            return {
                ...state,
                blocks: {
                    ...state.blocks,
                    past: [...state.blocks.past, cloneDeep(state.blocks.current)],
                    current: {...action.block},
                }
            }
        case REPLACE_CONTENT:
            return {
                ...state,
                blocks: {
                    ...state.blocks,
                    current: {
                        ...action.data
                    },
                }
            }
        case SELECT_BLOCK:
            return {
                ...state,
                blocks: {
                    ...state.blocks,
                    selected: action.clientId === null ? null : {
                        parent: null,
                        block: findBlockInState(state.blocks.current, action.clientId)
                    }
                }
            }
        case HOVER_BLOCK:
            return {
                ...state,
                blocks: {
                    ...state.blocks,
                    hovered: action.payload
                }
            }
        case SET_BLOCK_DRAGGED:
            return {
                ...state,
                blockDragged: action.block,
            }
        case EDIT_BLOCK:
            // Créer une copie profonde de l'état actuel de `current`
            const currentCopy = cloneDeep(state.blocks.current);

            // Créer une copie de `past` et y ajouter la copie profonde de `current`
            const pastCopy = [...state.blocks.past, currentCopy];

            // Mettre à jour `current` avec les nouvelles données
            const newCurrent = {...action.data};

            return {
                ...state,
                blocks: {
                    ...state.blocks,
                    past: pastCopy,
                    current: newCurrent,// Met à jour current avec une nouvelle copie des données
                }
            }
        case DELETE_BLOCK:
            return {
                ...state,
                blocks: {
                    ...state.blocks,
                    past: [...state.blocks.past, cloneDeep(state.blocks.current)],
                    current: {
                        ...removeBlockByClientId(state.blocks.current, action.clientId)
                    },
                    selected: null,
                }
            }
        case DUPLICATE_BLOCK:
            return {
                ...state,
                blocks: {
                    ...state.blocks,
                    current: {
                        ...state.blocks.current,
                        ...duplicateBlockByClientId(state.blocks.current, action.clientId)
                    },
                }
            }
        case EDIT_PREVIEW_MODE:
            return {
                ...state,
                page: {
                    ...state.page,
                    mode: action.viewMode
                }
            }
        case SET_MODAL:
            return {
                ...state,
                modal: action.data
            }
        case SET_TABS:
            return {
                ...state,
                tabs: {
                    ...state.tabs,
                    ...action.tab
                }
            }
        case ADD_COLUMN:
            return {
                ...state,
                blocks: {
                    ...state.blocks,
                    current: {
                        ...state.blocks.current,
                        ...duplicateBlockByClientId(state.blocks.current, action.clientId)
                    },
                }
            }
        case UNDO:
            if (state.blocks.past.length === 0) {
                return state
            }

            const previous = state.blocks.past[state.blocks.past.length - 1]
            const newPast = state.blocks.past.slice(0, state.blocks.past.length - 1)

            return {
                ...state,
                blocks: {
                    ...state.blocks,
                    past: newPast,
                    current: previous,
                    future: [state.blocks.current, ...state.blocks.future]
                }
            }
        case REDO:
            if (state.blocks.future.length === 0) {
                return state
            }

            const next = state.blocks.future[0]
            const newFuture = state.blocks.future.slice(1)
            return {
                ...state,
                blocks: {
                    ...state.blocks,
                    past: [...state.blocks.past, state.blocks.current],
                    current: next,
                    future: newFuture
                }

            }
        case SET_EDIT_MODE:
            return {
                ...state,
                editMode: action.editMode
            }
    }

    return state
}
