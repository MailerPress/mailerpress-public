import React, {useEffect, useMemo, useRef, useState} from "react"
import {createPortal} from "react-dom";
import {getEditorRoot} from "../../utils/editorRoot.ts";
import {useHover} from "../../hooks/useHoverBlock.ts";
import {useSelect, select} from "@wordpress/data";
import {sprintf, __} from "@wordpress/i18n";
import {blockType, STORE_KEY} from "../../constants.ts";
import ToolBar from "./ToolBar.tsx";
import {getPathToRoot} from "../../utils/block.ts";

const HoverToolTipBlock = () => {
    const [element, setElement] = useState(null)

    const {blockHover} = useSelect(select => {
        return {
            blockHover: select(STORE_KEY).getHoveredBlockId(),
        }
    }, [])

    useEffect(() => {
        if (blockHover && (blockHover.selectedClientId !== undefined || true)) {
            const element = getEditorRoot()!.querySelector(`.node-client-${blockHover.selectedClientId}`)
            if (element) {
                setElement(element)
            } else {
                const data = select(STORE_KEY).getBlocks()
                const pathRoot = getPathToRoot(data, blockHover.selectedClientId)
                if (blockHover.type === blockType.QUERY && pathRoot.find(p => p.type === blockType.WRAPPER)) {
                    const block = pathRoot.find(p => p.type === 'query')
                    setElement(getEditorRoot()!.querySelector(`.node-client-${block.children[0].clientId}`))
                }
            }

        }
    }, [blockHover]);

    function getInsertText() {
        let text = ''
        if (blockHover.direction === 'top') {
            text = sprintf(__(`Insert before %s`, 'mailerpress'), blockHover.type)
        } else if (blockHover.direction === 'bottom') {
            text = sprintf(__(`Insert after %s`, 'mailerpress'), blockHover.type)
        } else {
            text = sprintf(__(`Insert inside %s`, 'mailerpress'), blockHover.type)

        }

        return <div
            style={{
                background: 'var(--wp-admin-theme-color)',
                color: '#fff',
                position: "absolute",
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                paddingLeft: 8, paddingRight: 8
            }}>
            {text}
        </div>

    }

    const getTopPostition = (): string => {
        if (blockHover.direction === 'top') {
            return '0'
        } else if (blockHover.direction === 'bottom') {
            return '100%'
        } else {
            return '0'
        }
    }

    return useMemo(() => {
        return (
            <>
                {element && createPortal(
                    <div
                        className='interactive-prompt-hover'
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
                        <style>{`.email-block {position: relative;scroll-margin: 20px;}`}</style>

                        {blockHover &&
                            <div
                                style={{
                                    position: 'absolute',
                                    fontSize: 14,
                                    zIndex: 3,
                                    left: 0,
                                    top: getTopPostition(),
                                    width: '100%',
                                    pointerEvents: "none",

                                }}
                            >
                                {blockHover.direction !== 'inside' ?
                                    <div className="insert-bar" style={{
                                        width: '100%',
                                        height: 4,
                                        borderRadius: 6,
                                        background: 'var(--wp-admin-theme-color)',
                                        transition: 'width 0.4s linear'
                                    }}>
                                        {getInsertText()}
                                    </div> : <div className="insert-bar" style={{
                                        width: '100%',
                                        height: '100%',
                                        border: '2px solid #007cba',
                                        pointerEvents: "auto",
                                        zIndex: -1
                                    }}/>
                                }
                            </div>
                        }
                    </div>,
                    element,
                )}
            </>
        )

    }, [blockHover])

}
export default HoverToolTipBlock