import {useEffect, useMemo, useState, useCallback, useRef} from "react";
import {getBlockNodeByChildEle, getDirectionPosition, getNodeInfoByClassName} from "../utils/editorRoot.ts";
import {
    contentBlocks,
    getInsertPosition, updateDataByClientId,
} from "../utils/block.ts";
import {select, useDispatch, useSelect} from "@wordpress/data";
import {blockType, STORE_KEY} from "../constants.ts";
import {debounce} from "lodash";


export function useDropBlock() {
    const contentEditable = useRef(null);
    const [ref, setRef] = useState<HTMLElement | null>(null);
    const {setHoverBlockId, editBlock} = useDispatch(STORE_KEY)
    const {blocks, selectedBlock, getBlockDragged, blockHover} = useSelect(select => {
        return {
            blockHover: select(STORE_KEY).getHoveredBlockId(),
            blocks: select(STORE_KEY).getBlocks(),
            selectedBlock: select(STORE_KEY).getSelectedBlock(),
            getBlockDragged: select(STORE_KEY).getBlockDragged(),
        }
    }, [])

    function getCaretPosition(element) {
        const sel = window.getSelection();
        let caretPos = 0;

        // Helper function to calculate the caret position recursively
        function calculateCaret(node) {
            if (node === sel.focusNode) {
                // If we are at the focus node (caret node), add the offset
                caretPos += sel.focusOffset;
                return true;
            }

            if (node && node.nodeType === Node.TEXT_NODE) {
                // If the node is a text node, add its length to caret position
                caretPos += node.length;
            } else if (node && node.nodeType === Node.ELEMENT_NODE) {
                // If the node is an element, traverse its child nodes
                for (let child of node.childNodes) {
                    if (calculateCaret(child)) {
                        return true; // If caret is found in this child node, return true
                    }
                }
            }

            return false;
        }

        calculateCaret(element); // Start the recursive calculation from the root element
        return caretPos;
    }

    const {setDraft} = useDispatch(STORE_KEY);

    const verify = useCallback(
        debounce(value => {
            const selectedBlock = select(STORE_KEY).getSelectedBlock()
            if (selectedBlock && selectedBlock.block) {
                const previousData = localStorage.getItem('mailerpress_editor_state') ? JSON.parse(localStorage.getItem('mailerpress_editor_state')) : select(STORE_KEY).getBlocks()
                const data = updateDataByClientId(
                    previousData,
                    selectedBlock.block.clientId,
                    {content: value}
                )
                setDraft(data)
            }
        }, 500),
        []
    );

    useEffect(() => {
        if (ref) {
            let lastHoverTarget: EventTarget | null = null;
            let lastClientId: string | null = '';
            let selectionTimeout;

            let lastDragover: {
                target: EventTarget | null;
                valid: boolean;
            } = {
                target: null,
                valid: false,
            };


            const onMouseover = (ev: MouseEvent) => {
                if (lastHoverTarget === ev.target) return;
                lastHoverTarget = ev.target;

                const blockNode = getBlockNodeByChildEle(ev.target as HTMLElement);
            };

            const cantDropHere = (nodeInfo) => {

                const selectedBlock = select(STORE_KEY).getSelectedBlock()

                if (null === selectedBlock) {
                    return false
                }

                const elementDragged = document.querySelector(`.node-client-${selectedBlock.block.clientId}`);
                const elementTargeted = document.querySelector(`.node-client-${nodeInfo.clientId}`)

                if (
                    elementTargeted.classList.contains('pattern-footer') ||
                    elementTargeted.closest('.patter-footer')
                ) {
                    return true
                }

                switch (selectedBlock.block.type) {
                    case blockType.SECTION:
                    case blockType.WRAPPER:
                        return contentBlocks.includes(nodeInfo.type) || (selectedBlock.block.clientId === nodeInfo.clientId);
                    case blockType.QUERY:
                        return (
                            (
                                elementDragged && (elementDragged.classList.contains('block-pattern') && elementDragged.classList.contains(`node-client-${nodeInfo.clientId}`))
                            ) ||
                            elementDragged && null !== elementDragged.querySelector(`.node-client-${nodeInfo.clientId}`)
                        );
                    default:
                        return selectedBlock.block.clientId === nodeInfo.clientId

                }

            }

            const onDragOver = (ev: DragEvent) => {

                const blockNode = getBlockNodeByChildEle(ev.target as HTMLDivElement);
                lastDragover.target = ev.target;


                if (blockNode) {
                    const directionPosition = getDirectionPosition(
                        ev,
                        selectedBlock
                    );


                    const nodeInfo = getNodeInfoByClassName(blockNode)


                    if (null === directionPosition || true === cantDropHere(nodeInfo)) {
                        ev.preventDefault()
                        setHoverBlockId(null)
                        return
                    }


                    if (nodeInfo) {
                        const insertPos = getInsertPosition(
                            blocks,
                            nodeInfo,
                            getBlockDragged
                        )

                        if (insertPos) {
                            ev.preventDefault();
                            setHoverBlockId({
                                type: insertPos.type,
                                selectedClientId: insertPos.clientId,
                                direction: (insertPos.type === blockType.COLUMN && insertPos.children.length === 0) ? 'inside' : insertPos.direction ? insertPos.direction : directionPosition.vertical.direction,
                            })

                        }

                    }
                }
            };

            const onCheckDragLeave = (ev: DragEvent) => {
                if (!ev.target.closest('#editor-root')) {
                    setHoverBlockId(null)
                }
            }

            const onSelectionChange = () => {
                clearTimeout(selectionTimeout);
                // Set a new timeout to detect the end of selection
                selectionTimeout = setTimeout(() => {
                    // Selection considered final here
                    const selection = window.getSelection();
                    if (selection.rangeCount > 0) {
                        const selectedBlock = select(STORE_KEY).getSelectedBlock()
                        if (selectedBlock && selectedBlock.block) {
                            const elementSelected = ref.querySelector(`.node-client-${selectedBlock.block.clientId}`)
                            if (elementSelected) {
                                contentEditable.current = {
                                    clientId: selectedBlock.block.clientId,
                                    caretPosition: getCaretPosition(elementSelected.querySelector('[contenteditable="true"]'))
                                }
                            }
                        }
                    }
                }, 100); // 300ms delay to detect end of selection
            }

            ref.addEventListener('input', (e) => {
                verify(e.target.innerHTML)
            });

            document.addEventListener('selectionchange', onSelectionChange);

            ref.addEventListener('mouseover', onMouseover);
            ref.addEventListener('dragover', onDragOver);
            window.addEventListener('dragover', onCheckDragLeave);

            return () => {
                ref.removeEventListener('mouseover', onMouseover);
                ref.removeEventListener('dragover', onDragOver);
                window.removeEventListener('dragover', onCheckDragLeave);
                document.removeEventListener('selectionchange', onSelectionChange);
            };
        }

    }, [ref, blocks, getBlockDragged])

    return useMemo(
        () => ({
            ref,
            setRef,
            contentEditable
        }),
        [setRef]
    );

}