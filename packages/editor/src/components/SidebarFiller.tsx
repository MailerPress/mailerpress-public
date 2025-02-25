import React, {useEffect, useMemo} from 'react';
import Sidebar from "./Sidebar.tsx";
import {useSelect, useDispatch} from "@wordpress/data";
import {STORE_KEY} from "../constants.ts";
import {__} from "@wordpress/i18n";
import {
    findBlockInState,
    updateAttributesByClientId,
    updateDataAndAttributes,
    updateDataByClientId
} from "../utils/block.ts";
import BlockManager from "../core/BlockManager.ts";
import {useTheme} from "../context/Theme.tsx";
import {getEditorRoot} from "../utils/editorRoot.ts";
import {__experimentalText as Text} from "@wordpress/components";

const SidebarFiller = () => {
    const {theme} = useTheme()

    const {
        editBlock,
        setTheme,
        setTabs,
        editPreviewMode
    } = useDispatch(STORE_KEY)

    const {selectedBlock, data, tabs, previewMode} = useSelect(select => {
        return {
            data: select(STORE_KEY).getBlocks(),
            selectedBlock: select(STORE_KEY).getSelectedBlock(),
            previewMode: select(STORE_KEY).getPreviewMode(),
            tabs: select(STORE_KEY).getTabs(),
            editMode: select(STORE_KEY).getEditMode(),
        }
    }, [])

    const setAttributes = (attrs) => {
        editBlock(
            updateAttributesByClientId(
                data,
                selectedBlock.block.clientId,
                attrs
            )
        )
    }

    const setData = (attrs) => {
        editBlock(
            updateDataByClientId(
                data,
                selectedBlock.block.clientId,
                attrs
            )
        )

    }

    const setDataAndAttributes = (update) => {
        editBlock(
            updateDataAndAttributes(
                data,
                selectedBlock.block.clientId,
                update
            )
        )
    }

    const edit = useMemo(() => {
        if (selectedBlock && selectedBlock.block !== null) {
            const blockType = selectedBlock.block.id !== undefined ? BlockManager.getPatternById(selectedBlock.block.id) || BlockManager.getQueryPatternById(selectedBlock.block.id) : BlockManager.getBlockByType(selectedBlock.block.type)
            if (blockType && blockType.edit) {
                // selectBlock(selectedBlock.block.clientId)
                return <blockType.edit
                    element={document.querySelector(`.node-client-${selectedBlock.block.clientId}`)}
                    block={findBlockInState(data, selectedBlock.block.clientId)}
                    setAttributes={setAttributes}
                    setData={setData}
                    setDataAndAttributes={setDataAndAttributes}
                    setTheme={setTheme}
                    theme={theme}
                />
            }
        }
    }, [data, selectedBlock, theme])

    useEffect(() => {
        if (selectedBlock && selectedBlock.block) {
            if (getEditorRoot()!.querySelector(`.node-client-${selectedBlock.block.clientId}`)) {
                setTabs({
                    ...tabs,
                    settings: 1
                })
                editPreviewMode(previewMode)
            }

        }
    }, [selectedBlock, previewMode]);

    return (
        <Sidebar.Fill>
            {selectedBlock && selectedBlock.block ? edit :
                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    margin: 10
                }}>
                    <Text
                        uppercase={true}
                        weight={500}
                    >
                        {__('No block selected', 'mailerpress')}
                    </Text>
                </div>}
        </Sidebar.Fill>
    );
};

export default SidebarFiller;