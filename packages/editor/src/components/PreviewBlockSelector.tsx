import React, {useEffect, useRef, useState} from "react"
import {createPortal} from "react-dom";
import {getEditorRoot} from "../utils/editorRoot.ts";

const PreviewBlockSelector = () => {
    const rootRef = useRef<DOMRect | null>(null);
    const [element, setElement] = useState(null)
    useEffect(() => {
        rootRef.current = getEditorRoot()!.getBoundingClientRect()
        getEditorRoot()!.addEventListener('click', (e) => {
            e.stopImmediatePropagation()
            setElement(e.target.closest('.email-block'))
        })
    }, []);


    return (
        <>
            {element && createPortal(
                <div
                    class='interactive-prompt-focused'
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
                    <style>{`.email-block {position: relative;}`}</style>

                    <div className="interactive-prompt-focused__focus" style={{
                        'position': 'absolute',
                        zIndex: 2,
                        'left': 0,
                        'top': 0,
                        'width': '100%',
                        'height': '100%',
                        outlineOffset: '-2px',
                        'outline': '2px solid #0087be'
                    }}/>
                </div>,
                element,
            )}
        </>
    )
}
export default PreviewBlockSelector