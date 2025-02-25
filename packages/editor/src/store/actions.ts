import Block from "../interfaces/block.ts";
import {BlocksState, IEmailConfig, ITabs, TModal} from "../interfaces/block-editor-state.ts";
import {blockType} from "../core/regisetBlockType.ts";

export const UPDATE_PATTERNS_LIB = 'UPDATE_PATTERNS_LIB'
export const DELETE_PATTERN = 'DELETE_PATTERN'
export const TOGGLE_BLOCK_SIDEBAR = 'TOGGLE_BLOCK_SIDEBAR'
export const TOGGLE_SECONDARY_SIDEBAR = 'TOGGLE_SECONDARY_SIDEBAR'
export const UNDO = 'UNDO'
export const REDO = 'REDO'
export const SET_BLOCKS = 'SET_BLOCKS'
export const EDIT_BLOCK = 'EDIT_BLOCK'
export const SELECT_BLOCK = 'SELECT_BLOCK'
export const HOVER_BLOCK = 'HOVER_BLOCK'
export const SET_BLOCK_DRAGGED = 'SET_BLOCK_DRAGGED'
export const DUPLICATE_BLOCK = 'DUPLICATE_BLOCK'
export const DELETE_BLOCK = 'DELETE_BLOCK'
export const EDIT_PREVIEW_MODE = 'EDIT_PREVIEW_MODE'
export const REPLACE_CONTENT = 'REPLACE_CONTENT'
export const SET_MODAL = 'SET_MODAL'
export const SET_TABS = 'SET_TABS'
export const SET_EMAIL_CONFIG = 'SET_EMAIL_CONFIG'
export const ADD_COLUMN = 'ADD_COLUMN'
export const SET_EDIT_MODE = 'SET_EDIT_MODE'
export const SET_THEME = 'SET_THEME'
export const SET_DRAFT = 'SET_DRAFT'
export const CLEAR_DRAFT = 'CLEAR_DRAFT'
export const SET_FONT = 'SET_FONT'

export const INSTALL_FONT = 'INSTALL_FONT'

export const REMOVE_FONT = 'REMOVE_FONT'

const actions = {
    removeFont(font) {
        return {
            type: REMOVE_FONT,
            font
        };
    },
    installFont(font) {
        return {
            type: INSTALL_FONT,
            font
        };
    },
    setFont(key, selectedFont, selectedVariant) {
        return {
            type: SET_FONT,
            key,
            selectedFont,
            selectedVariant
        };
    },
    setDraft(content) {
        localStorage.setItem('mailerpress_editor_state', JSON.stringify(content));
        return {
            type: SET_DRAFT,
            draft: content,
        };
    },
    clearDraft() {
        localStorage.removeItem('mailerpress_editor_state');
        return {
            type: CLEAR_DRAFT,
        };
    },
    deletePattern: (id) => {
        return {
            type: DELETE_PATTERN,
            id
        }
    },
    updatePatternList: (payload) => {
        return {
            type: UPDATE_PATTERNS_LIB,
            payload
        }
    },
    toggleBlockSidebar: () => {
        return {
            type: TOGGLE_BLOCK_SIDEBAR,
        }
    },
    toggleSecondarySidebar: () => {
        return {
            type: TOGGLE_SECONDARY_SIDEBAR,
        }
    },
    setTheme: (name: string) => {
        return {
            type: SET_THEME,
            name
        }
    },
    setEmailConfig: (config: IEmailConfig) => {
        return {
            type: SET_EMAIL_CONFIG,
            config

        }
    },
    addBlock: (block: Block) => {
        return {
            type: SET_BLOCKS,
            block

        }
    },
    editPreviewMode: (viewMode: 'mobile' | 'desktop') => {
        return {
            type: EDIT_PREVIEW_MODE,
            viewMode
        }
    },
    selectBlock: (clientId: string) => {
        return {
            type: SELECT_BLOCK,
            clientId
        }
    },
    setHoverBlockId: (payload: string) => {
        return {
            type: HOVER_BLOCK,
            payload
        }
    },
    setBlockDragged: (block: blockType | null) => {
        return {
            type: SET_BLOCK_DRAGGED,
            block
        }
    },
    editBlock: (data: object) => {
        return {
            type: EDIT_BLOCK,
            data
        }
    },
    deleteBlock: (clientId: string) => {
        return {
            type: DELETE_BLOCK,
            clientId
        }
    },
    duplicateBlock: (clientId: string) => {
        return {
            type: DUPLICATE_BLOCK,
            clientId
        }
    },
    replaceContent: (data) => {
        return {
            type: REPLACE_CONTENT,
            data
        }
    },
    setModal: (data: TModal | null) => {
        return {
            type: SET_MODAL,
            data
        }
    },
    setTabs: (tab: ITabs) => {
        return {
            type: SET_TABS,
            tab
        }
    },
    addColumn: (data) => {
        return {
            type: ADD_COLUMN,
            data
        }
    },
    undo: () => {
        return {
            type: UNDO,
        }
    },
    redo: () => {
        return {
            type: REDO,
        }
    },
    setEditMode: editMode => {
        return {
            type: SET_EDIT_MODE,
            editMode
        }
    },
}

export default actions