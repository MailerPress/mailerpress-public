import React, {useEffect, useRef, useState} from "react"
import {createPortal} from "react-dom";
import {getEditorRoot} from "../../utils/editorRoot.ts";
import {useHover} from "../../hooks/useHoverBlock.ts";
import {useSelect} from "@wordpress/data";
import {STORE_KEY} from "../../constants.ts";
import ToolBar from "./ToolBar.tsx";

const HoverToolTipBlock = () => {
    const [element, setElement] = useState(null)

    const {blockHover, blocks} = useSelect(select => {
        return {
            blockHover: select(STORE_KEY).getHoveredBlockId(),
            blocks: select(STORE_KEY).getBlocks(),
        }
    }, [])

    useEffect(() => {
        if (blockHover && (blockHover.selectedClientId !== undefined || blockHover.selectedClientId !== null)) {
            setElement(
                getEditorRoot()!.querySelector(`.node-client-${blockHover.selectedClientId}`)
            )
        } else {
            getEditorRoot().addEventListener('mouseover', (e) => {
                e.stopImmediatePropagation()
                setElement(e.target.closest('.email-block'))
            })
        }

    }, [blockHover]);

    function getInsertText() {
        let text = ''
        if (blockHover.direction === 'top') {
            text = `Insert before ${blockHover.type}`
        } else if (blockHover.direction === 'bottom') {
            text = `Insert after ${blockHover.type}`
        } else {
            text = `Insert inside ${blockHover.type}`

        }

        return <div
            style={{
                background: '#007cba',
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
                                // height: blockHover.direction !== 'inside' ? 'initial': '100%',
                                pointerEvents: "none",

                            }}
                        >
                            {blockHover.direction !== 'inside' ?
                                <div className="insert-bar" style={{
                                    width: '100%',
                                    height: 4,
                                    borderRadius: 6,
                                    background: "#007cba",
                                    transition: 'width 0.4s linear'
                                }}>
                                    {getInsertText()}
                                </div> : <div className="insert-bar" style={{
                                    width: '100%',
                                    height: '100%',
                                    border: '2px solid red',
                                    pointerEvents: "auto",
                                    zIndex: -1
                                }} />
                            }
                        </div>
                    }
                </div>,
                element,
            )}
        </>
    )
}
export default HoverToolTipBlock