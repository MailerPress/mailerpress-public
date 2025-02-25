import React, {useCallback, useEffect, useMemo, useRef, useState} from "react"
import {createPortal} from "react-dom";
import {getEditorRoot} from "../../utils/editorRoot.ts";
import {findBlockInState, getClientIdByClassNames} from "../../utils/block.ts";
import {select, useDispatch, useSelect, dispatch} from "@wordpress/data";
import {blockType, STORE_KEY} from "../../constants.ts";
import ToolBar from "./ToolBar.tsx";
import {usePrevious} from "../../hooks/usePrevious.ts";

const FocusToolTipBlock = ({editMode, previewMode}) => {
    const {selectBlock} = useDispatch(STORE_KEY)

    const {selectedBlock} = useSelect(select => {
        return {
            selectedBlock: select(STORE_KEY).getSelectedBlock(),
            data: select(STORE_KEY).getBlocks(),
        }
    }, [])

    // const [element, setElement] = useState(null)

    const handleClick = useCallback((e) => {
        if (editMode === 'builder') {
            e.stopImmediatePropagation()

            const element = e.target.closest('.email-block')

            if (e.target.hasAttribute('href') || e.target.parentElement.hasAttribute('href')) {
                e.preventDefault()
            }

            if (element) {
                const classesElementArr = e.target.closest('.block-pattern') ? e.target.closest('.block-pattern').getAttribute('class').split(' ') : element.getAttribute('class').split(' ')
                if (classesElementArr.length) {
                    const node = classesElementArr.find(c => c.startsWith('node-client-'))
                    const clientId = node.replace('node-client-', '')

                    const blockSelected = select(STORE_KEY).getSelectedBlock()

                    if (blockSelected && blockSelected.block && blockSelected.block.clientId === clientId) {
                        //selectBlock(null)
                    } else {
                        selectBlock(clientId)
                        if (false === select(STORE_KEY).secondarySidebarOpen()) {
                            setTimeout(() => {
                                dispatch(STORE_KEY).toggleSecondarySidebar()
                            }, 10)
                        }
                    }

                }
            }
        }
    }, [editMode])

    useEffect(() => {
        getEditorRoot()!.addEventListener('click', handleClick)
        return () => {
            getEditorRoot()!.removeEventListener('click', handleClick)
        }

    }, [editMode]);


    const selectedElement = useMemo(() => {
        if (selectedBlock === null || null === getEditorRoot()) {
            return null
        }

        if (getEditorRoot()!.querySelector(`.hide-desktop-block.node-client-${selectedBlock.block.clientId}`)) {
            if (previewMode === 'mobile') {
                return getEditorRoot()!.querySelector(`.hide-desktop-block.node-client-${selectedBlock.block.clientId}`);
            } else {
                return getEditorRoot()!.querySelector(`.hide-mobile-block.node-client-${selectedBlock.block.clientId}`);
            }
        } else {
            if (getEditorRoot()!.querySelector(`.node-client-${selectedBlock.block.clientId}`)) {
                return getEditorRoot()!.querySelector(`.node-client-${selectedBlock.block.clientId}`)
            } else {
                if (getEditorRoot()!.querySelector(`.node-client-${selectedBlock.block.children[0].clientId}`)) {
                    return getEditorRoot()!.querySelector(`.node-client-${selectedBlock.block.children[0].clientId}`)
                }
            }
        }
        return null
    }, [selectedBlock])

    return (
        <>
            {selectedBlock && selectedElement && createPortal(
                <div
                    className='interactive-prompt-focused'
                    style={{
                        position: 'absolute',
                        height: '100%',
                        width: '100%',
                        top: 0,
                        left: 0,
                        zIndex: 2,
                        pointerEvents: 'none',
                    }}
                >
                    <style>
                        {`.email-block {position: relative;scroll-margin: 20px;}`}
                        {`.focus-toolbar {background: #0087be; width:max-content; height: 22px; padding: 0 4px; color: white; position: absolute; top: 100%;align-items: center;}`}
                    </style>


                    <div className="interactive-prompt-focused__focus" style={{
                        'position': 'absolute',
                        zIndex: 2,
                        'left': 0,
                        'top': 0,
                        'width': '100%',
                        'height': '100%',
                        border: '2px solid var(--wp-admin-theme-color)',
                        boxSizing: 'border-box'
                    }}/>
                </div>,
                selectedElement,
            )}
        </>
    )

}
export default FocusToolTipBlock