import {select, useDispatch, useSelect} from "@wordpress/data";
import {STORE_KEY, blockType as blockTypeEnum} from "../../constants.ts";
import BlockManager from "../../core/BlockManager.ts";
import BlockInserter from "../../components/BlockInserter.tsx";
import {blockType} from "../../core/regisetBlockType.ts";
import {
    addBlockInsideClientId,
    canAddChildren,
    findParent,
} from "../../utils/block.ts";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {
    createSlotFill,
    Popover,
    Toolbar as WpToolBar,
    ToolbarButton,
    ToolbarDropdownMenu,
    ToolbarGroup
} from "@wordpress/components";
import {
    chevronDown,
    copy,
    levelUp,
    trash
} from "@wordpress/icons";
import BlockGenerator from "../../core/BlockGenerator.ts";
import {__} from "@wordpress/i18n";
import {getEditorRoot} from "../../utils/editorRoot.ts";

const {Slot, Fill} = createSlotFill(
    'ToolBarFill'
);

const ToolBar = ({selectedBlock, previewMode}) => {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(true)
    const {data, blockHover, getBlockDragged} = useSelect(select => {
        return {
            getBlockDragged: select(STORE_KEY).getBlockDragged(),
            data: select(STORE_KEY).getBlocks(),
            blockHover: select(STORE_KEY).getHoveredBlockId(),
        }
    }, [])

    const {
        addBlock,
        selectBlock,
        deleteBlock,
        duplicateBlock,
        setBlockDragged,
        setHoverBlockId
    } = useDispatch(STORE_KEY)


    const onInsert = (block: blockType) => {
        if (selectedBlock && selectedBlock.block) {
            addBlock(
                addBlockInsideClientId(
                    data,
                    selectedBlock.block.clientId,
                    BlockGenerator.generate(
                        block,
                        selectedBlock.block
                    )
                )
            )
            selectBlock(clientId)
        }
    };

    const selectParent = () => {
        const parent = findParent(data, selectedBlock.block.clientId)
        if (parent) {
            selectBlock(parent.clientId)
        }
    }

    const onDragStart = (event, block) => {
        const originalNode = event.target;
        originalNode.style.opacity = '0';
        originalNode.style.cursor = 'move';
        const blockType = originalNode.getAttribute('data-type')
        const id = originalNode.getAttribute('id')
        let blockDragged = null

        if (blockType === 'pattern' || blockType === blockTypeEnum.QUERY_PATTERN) {
            blockDragged = BlockManager.getPatternById(id)
        } else {
            blockDragged = BlockManager.getBlockByType(blockType)
        }

        // Clone the node
        const clonedNode = document.createElement('div'); // `true` clones the element along with its children

        clonedNode.insertAdjacentHTML('afterbegin', `
            <div style="display:flex; align-items: center;gap: 4px">
               <span style="fill: white;display: flex;">${blockDragged.icon}</span>
               <span style="font-size: 12px; text-transform: uppercase; letter-spacing:1.1">${blockDragged.name}</span>
            </div>
        `);
        // Style the clone (optional)
        clonedNode.style.position = 'absolute';
        clonedNode.style.cursor = 'move';
        clonedNode.style.pointerEvents = 'none'; // Prevents interactions with the clone during drag
        clonedNode.style.background = '#000';
        clonedNode.style.color = 'white';
        clonedNode.style.zIndex = '999999';
        clonedNode.style.padding = '8px 8px 8px 20px';
        clonedNode.style.borderRadius = '6px';
        clonedNode.style.boxShadow = '0px 10px 15px -3px rgba(0,0,0,0.1);\n';

        setTimeout(() => {
            setVisible(false)
        }, 100)

        // Append the cloned node to the body
        document.body.appendChild(clonedNode);

        // Update the clone's position as the mouse moves
        originalNode.addEventListener('drag', (dragEvent) => {
            clonedNode.style.left = `${dragEvent.pageX}px`;
            clonedNode.style.top = `${dragEvent.pageY}px`;
        });

        // Add dragend listener to the original node to ensure it's triggered properly
        originalNode.addEventListener(
            'dragend',
            () => {
                clonedNode.remove();
                const blockHover = select(STORE_KEY).getHoveredBlockId()
                if (null !== blockHover) {
                    const newData = BlockGenerator.move(
                        block,
                        select(STORE_KEY).getHoveredBlockId(),
                        data
                    )

                    addBlock(newData)
                }
                setVisible(true)
                selectBlock(null)
                setHoverBlockId(null)
            },
            {once: true} // Ensures this handler runs only once
        );

        setBlockDragged(blockDragged);

    }

    const onDragEnd = useCallback(() => {

        const newData = BlockGenerator.move(
            selectedBlock.block,
            blockHover,
            data
        )

        addBlock(newData)
        selectBlock(null)
        setHoverBlockId(null)

    }, [blockHover, selectedBlock]);

    useEffect(() => {
        const ele = ref.current;
        if (!ele) return;

        ele.addEventListener('dragend', onDragEnd);
        return () => {
            ele.removeEventListener('dragend', onDragEnd);
        };
    }, [onDragEnd]);

    const getAnchor = useMemo(() => {
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
        visible &&
        <Popover
            position="top right"
            variant="unstyled"
            offset={10}
            focusOnMount={true}
            animate={false}
            anchor={getAnchor}
        >
            <WpToolBar
                id="options-toolbar"
                label="Options"
            >
                <>
                    <ToolbarGroup
                        data-type={`${selectedBlock.block.type}`}
                        id={`${selectedBlock.block.id}`}
                        key={selectedBlock.block.clientId}
                        style={{cursor: 'move'}}
                    >
                        <ToolbarButton
                            __experimentalIsFocusable={true}
                            icon={
                                <span
                                    dangerouslySetInnerHTML={{
                                        __html:
                                            selectedBlock.block && (selectedBlock.block.id !== undefined) ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false" style="fill: currentcolor;"><path d="M21.3 10.8l-5.6-5.6c-.7-.7-1.8-.7-2.5 0l-5.6 5.6c-.7.7-.7 1.8 0 2.5l5.6 5.6c.3.3.8.5 1.2.5s.9-.2 1.2-.5l5.6-5.6c.8-.7.8-1.9.1-2.5zm-1 1.4l-5.6 5.6c-.1.1-.3.1-.4 0l-5.6-5.6c-.1-.1-.1-.3 0-.4l5.6-5.6s.1-.1.2-.1.1 0 .2.1l5.6 5.6c.1.1.1.3 0 .4zm-16.6-.4L10 5.5l-1-1-6.3 6.3c-.7.7-.7 1.8 0 2.5L9 19.5l1.1-1.1-6.3-6.3c-.2 0-.2-.2-.1-.3z"></path></svg>' : BlockManager.getBlockByType(selectedBlock.block.type)?.icon

                                    }}
                                />
                            }
                            text={
                                selectedBlock.block && (selectedBlock.block.id !== undefined) ? (BlockManager.getPatternById(selectedBlock.block.id)?.name || BlockManager.getQueryPatternById(selectedBlock.block.id)?.name) : BlockManager.getBlockByType(selectedBlock.block.type)?.name
                            }
                        />
                    </ToolbarGroup>

                    {selectedBlock.block && <>
                        {selectedBlock.block.type !== blockTypeEnum.PAGE &&
                            <ToolbarGroup>
                                <ToolbarButton
                                    onClick={selectParent}
                                    icon={levelUp}
                                    title={__('Select parent block', 'mailerpress')}
                                />

                                {
                                    selectedBlock.block.data && selectedBlock.block.data.lock || undefined === selectedBlock.block.data.lock &&
                                    canAddChildren(selectedBlock) &&
                                    selectedBlock && <ToolbarButton>
                                        <BlockInserter selectedBlock={selectedBlock} onInsert={onInsert}/>
                                    </ToolbarButton>

                                }
                                <Slot bubblesVirtually/>
                            </ToolbarGroup>
                        }
                        {(selectedBlock && selectedBlock.block && selectedBlock.block.data) && false === selectedBlock.block.data.lock || undefined === selectedBlock.block.data.lock &&

                            <ToolbarDropdownMenu
                                controls={[
                                    {
                                        icon: copy,
                                        title: 'Duplicate',
                                        onClick: () => duplicateBlock(selectedBlock.block.clientId)
                                    },
                                    {
                                        icon: trash,
                                        title: 'Delete',
                                        onClick: () => {
                                            const parent = findParent(data, selectedBlock.block.clientId)
                                            if (parent && (parent.type === blockTypeEnum.COLUMN && parent.children.length === 1)) {
                                                const sectionParent = findParent(data, parent.clientId)
                                                if (sectionParent.children.length === 1) {
                                                    deleteBlock(sectionParent.clientId)
                                                } else {
                                                    deleteBlock(selectedBlock.block.clientId)
                                                }
                                            } else {
                                                deleteBlock(selectedBlock.block.clientId)

                                            }
                                        }
                                    },
                                ]}
                                icon={chevronDown}
                                label={__('More options', 'mailerpress')}
                            />
                        }
                    </>
                    }
                </>
            </WpToolBar>
        </Popover>
    )
}

ToolBar.Fill = Fill;

export default ToolBar