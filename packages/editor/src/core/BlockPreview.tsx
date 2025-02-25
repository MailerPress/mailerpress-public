import React, {useCallback, useEffect, useState} from "react"
import {TabPanel} from "@wordpress/components";
import {dispatch, select, useSelect} from "@wordpress/data";
import {STORE_KEY} from "../constants.ts";
import {desktop, mobile} from "@wordpress/icons";
import {getEditorRoot} from "../utils/editorRoot.ts";

const BlockPreview = (props) => {

    const {selectedBlock, previewMode, editMode} = useSelect(select => {
        return {
            selectedBlock: select(STORE_KEY).getSelectedBlock(),
            previewMode: select(STORE_KEY).getPreviewMode(),
            editMode: select(STORE_KEY).getEditMode(),
        }
    }, [])


    const content = wp.hooks.applyFilters(
        'blockPreview',
        <props.render {...props} />,
        props,
        {
            selectedBlock,
            previewMode,
            editMode,
            dispatch,
            select,
            STORE_KEY,
            TabPanel,
            desktop,
            mobile}
    );

    return content;
}

export default BlockPreview