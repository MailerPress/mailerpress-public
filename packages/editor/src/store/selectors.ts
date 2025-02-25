import BlockEditorState, {IEmailConfig, ITabs, PatternsCategories, TModal} from "../interfaces/block-editor-state.ts";
import {blockType} from "../core/regisetBlockType.ts";
import {TPattern} from "../core/BlockManager.ts";

const selectors = {
    getEmailConfig: (state: BlockEditorState): IEmailConfig => state.emailConfig,
    getBlocks: (state: BlockEditorState): object => state.blocks.current,
    getBlocksState: (state: BlockEditorState): object => state.blocks,
    getSelectedBlock: (state: BlockEditorState) => state.blocks.selected,
    getHoveredBlockId: (state: BlockEditorState) => state.blocks.hovered,
    getBlockDragged: (state: BlockEditorState): blockType | null => state.blockDragged,
    getPreviewMode: (state: BlockEditorState): 'phone' | 'desktop' => state.page.mode,
    getPatternsCategories: (state: BlockEditorState): PatternsCategories => state.blocks.patternsCategories,
    getTemplatesCategories: (state: BlockEditorState): PatternsCategories => state.blocks.templatesCategories,
    getModal: (state: BlockEditorState): TModal | null => state.modal,
    getTabs: (state: BlockEditorState): ITabs => state.tabs,
    canUndo: (state: BlockEditorState): boolean => state.blocks.past.length > 0,
    canRedo: (state: BlockEditorState): boolean => state.blocks.future.length > 0,
    getEditMode: (state: BlockEditorState): 'live' | 'builder' => state.editMode,
    getTheme: (state: BlockEditorState): string => state.theme,
    blockSidebarOpen: (state: BlockEditorState): boolean => state.sidebar.blockDisplayed,
    secondarySidebarOpen: (state: BlockEditorState): boolean => state.sidebar.secondarySidebarOpen,
    patterns: (state: BlockEditorState): Array<TPattern> => state.patterns,
    getDraft(state) {
        return state.draft;
    },
    hasLocalStorageDraft(state) {
        return !!state.draft;
    },
    getFonts(state) {
        return state.fonts;
    },
    getInstalledFont(state) {
        return state.fontsInstalled;
    },
}

export default selectors