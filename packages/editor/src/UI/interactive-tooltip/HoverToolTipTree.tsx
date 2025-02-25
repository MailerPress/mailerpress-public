import React, {useEffect, useMemo, useRef, useState} from "react"
import {createPortal} from "react-dom";
import {getEditorRoot} from "../../utils/editorRoot.ts";
import {useHover} from "../../hooks/useHoverBlock.ts";
import {useSelect, select} from "@wordpress/data";
import {sprintf, __} from "@wordpress/i18n";
import {blockType, STORE_KEY} from "../../constants.ts";
import ToolBar from "./ToolBar.tsx";
import {getPathToRoot} from "../../utils/block.ts";

const HoverToolTipTree = ({inserter, dragElement}) => {
    const [element, setElement] = useState(null)

    useEffect(() => {
        if (inserter && inserter.target) {
            if (
                inserter.target.getAttribute('data-locked') === true

            ) {
                setElement(null)
            } else {
                if (
                    false === dragElement.blockDragged.lock ||
                    undefined === dragElement.blockDragged.lock
                ) {
                    if (dragElement.clientId !== inserter.target.getAttribute('data-client-id')) {
                        setElement(inserter.target)
                    }
                }
            }
        } else {
            setElement(null)
        }
    }, [inserter]);

    const getTop = () => {
        if (inserter && inserter.direction && 'inside' !== inserter.direction) {
            if (inserter.direction === 'top') {
                return '0%'
            } else {
                return '100%'
            }
        }

        return null
    }


    return useMemo(() => {
        return (
            <>
                {element &&
                    createPortal(
                        <div
                            className="tralala"
                            style={{
                                position: 'absolute',
                                height: '100%',
                                width: '100%',
                                top: 0,
                                left: 0,
                                zIndex: 2,
                                pointerEvents: 'none',
                                background: getTop() === null ? '#f0f0f0': 'transparent',
                                opacity: getTop() === null ? '0.9': '1',

                            }}
                        >
                            {getTop() &&
                                <div
                                    style={{
                                        position: 'absolute',
                                        fontSize: 14,
                                        zIndex: 3,
                                        left: 0,
                                        top: getTop(),
                                        width: '100%',
                                        pointerEvents: "none",

                                    }}
                                >
                                    <div
                                        style={{
                                            width: '100%',
                                            height: 4,
                                            borderRadius: 6,
                                            background: 'var(--wp-admin-theme-color)',
                                        }}
                                    >
                                    </div>
                                </div>
                            }
                        </div>
                        , element
                    )
                }
            </>
        )
    }, [inserter])

}
export default HoverToolTipTree