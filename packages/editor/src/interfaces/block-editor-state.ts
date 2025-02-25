import Block from "./block.ts";
import {blockType} from "../core/regisetBlockType.ts";
import {FC} from "react";
import {TPattern} from "../core/BlockManager.ts";

interface Component {
    label: string;
}

export interface PatternsCategories {
    [key: string]: Component;
}


export interface BlocksState {
    past: Block[][],
    patternsCategories: PatternsCategories,
    templatesCategories: PatternsCategories,
    current: object,
    future: Block[][],
    selected: Record<"parent" | "block", Block | null> | null
    hovered: Record<"type" | "selectedClientId" | "direction", blockType | string | undefined | null | string> | null
}

export interface SidebarState {
    blockDisplayed: boolean,
    secondarySidebarOpen: boolean,
    activeTab: string,
    blockEdited: Array<Block> | null
}

export interface pageState {
    mode: 'desktop' | 'mobile',
}

export interface TModal {
    title: string,
    component: FC,
    className: string
}

export interface ITabs {
    blocks: number,
    settings: number
}

export interface IEmailConfig {
    campaignName: string
    campaignSubject: string,
    campaignList: string,
    sendChoice: string,
    sendAt: null | Date,
    hasBatch: string | null
}

export default interface BlockEditorState {
    blocks: BlocksState
    sidebar: SidebarState,
    page: pageState,
    blockDragged: blockType | null,
    modal: TModal | null,
    tabs: ITabs,
    emailConfig: IEmailConfig | null
    editMode: 'builder' | 'live',
    patterns: Array<TPattern>
}