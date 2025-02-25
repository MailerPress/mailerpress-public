import React, {useEffect, useState} from 'react';
import {useDispatch, useSelect} from "@wordpress/data";
import {blockType as blockTypeEnum, blockType, STORE_KEY} from "../../constants.ts";
import {
    chevronDownSmall,
    chevronRightSmall,
    Icon,
    moreVertical,
    seen,
    unseen,
    lockOutline,
    symbol,
    dragHandle
} from "@wordpress/icons";
import {
    __experimentalText as Text,
    __experimentalInputControl as InputControl,
    __experimentalHStack as HStack,
    __experimentalVStack as VStack,
    Button,
    MenuGroup,
    MenuItem,
    Popover, SelectControl
} from "@wordpress/components";
import cx from "classnames/bind";
import BlockManager from "../../core/BlockManager.ts";
import {
    addBlockInsideClientId,
    findBlockInState, getPathToRoot,
    removeAllClientId,
    updateDataByClientId,
    wrapSectionInWrapper
} from "../../utils/block.ts";
import {v4 as uuidv4} from 'uuid';
import {usePrevious} from "../../hooks/usePrevious.ts";
import {__} from "@wordpress/i18n";
import {ApiService} from "../../core/apiService.ts";
import {useToasts} from "../../hooks/useToasts.ts";
import {motion} from 'framer-motion';
import BlockGenerator from "../../core/BlockGenerator.ts";
import {putInsideWrapper} from "../../core/block-operation/blockGeneration.ts";
import {removeAndMove} from "../../core/block-operation/blockOperations.ts";

const CreatePatternModal = ({node}) => {
    const [patternName, setPatternName] = useState('');
    const [patternCategory, setPatternCategory] = useState('');
    const {pushToast} = useToasts();
    const {setModal, updatePatternList} = useDispatch(STORE_KEY)
    const savePattern = () => {

        const data = removeAllClientId(node)

        ApiService.savePattern({
            patternName,
            patternCategory,
            patternJSON: JSON.stringify(data)
        }).then(pattern => {
            pushToast({
                title: __('Pattern created successfully', 'mailerpress'),
                type: 'success',
                duration: 5
            })
            setModal(null)
            const p = {
                postId: pattern.ID,
                c: pattern.ID,
                database: true,
                id: `pattern-${pattern.ID}`,
                type: 'pattern',
                category: patternCategory,
                name: patternName,
                internal: false,
                json: data,
                template: () => ''
            }
            updatePatternList(p)
            BlockManager.setPatternFromAdmin(p)
        })
    }

    return (
        <VStack style={{width: '100%'}}>
            <InputControl
                value={patternName}
                label={__('Name', 'mailerpress')}
                onChange={setPatternName}
            />
            <div style={{marginTop: 16}}>
                <SelectControl
                    value={patternCategory}
                    __nextHasNoMarginBottom
                    label={__('Category', 'mailerpress')}
                    onChange={setPatternCategory}
                    options={[
                        {value: '', label: ''},
                        ...Object.entries(window.jsVars.patternCategories).reduce((acc, item) => {
                            acc.push({
                                label: item[1].label,
                                value: item[0]
                            })
                            return acc
                        }, [])
                    ]}
                />
            </div>
            <div style={{marginTop: 16}}>
                <HStack
                    expanded={false}
                    justify={'flex-end'}
                    spacing="3"
                >
                    <Button variant="tertiary" onClick={() => setModal(null)}>
                        {__('Cancel', 'mailerpress')}
                    </Button>
                    <Button disabled={patternName === '' || patternCategory === ''}
                            variant="primary"
                            onClick={savePattern}>
                        {__('Add', 'mailerpress')}
                    </Button>
                </HStack>
            </div>
        </VStack>
    )
}
const TreeNode = ({
                      node,
                      expandedNodes,
                      setExpandedNodes,
                      popover,
                      setPopover,
                      isChildren,
                      dragElement,
                      setDragElement,
                      elementHovered,
                      onDrop,
                  }) => {
    const [visibility, setVisibility] = useState(node.data ? node.data.hidden ?? false : false)
    const [locked, setLocked] = useState(node.data ? (node.type !== 'page' && node.data.lock) ?? false : false)
    const isExpanded = expandedNodes ? expandedNodes.includes(node.clientId) : false;
    const {selectBlock, deleteBlock, duplicateBlock, editBlock, addBlock} = useDispatch(STORE_KEY)
    const {selectedBlock} = useSelect(select => {
        return {
            selectedBlock: select(STORE_KEY).getSelectedBlock(),
        }
    }, [])

    const {setModal} = useDispatch(STORE_KEY)

    const {data} = useSelect(select => {
        return {
            data: select(STORE_KEY).getBlocks(),
        }
    }, [])

    const previousVisibility = usePrevious(visibility)
    const handleToggle = () => {
        if (isExpanded) {
            setExpandedNodes(expandedNodes.filter(id => id !== node.clientId));
        } else {
            setExpandedNodes([...expandedNodes, node.clientId]);
        }
    };

    const getName = () => {
        let block = null;

        if (node.id !== undefined) {

            block = BlockManager.getPatternById(node.id) || BlockManager.getQueryPatternById(node.id)
        } else {
            block = BlockManager.getBlockByType(node.type)
        }

        if (block) {
            return block.name
        }

        return ''
    }

    useEffect(() => {
        if (previousVisibility !== undefined && (visibility !== previousVisibility)) {
            editBlock(
                updateDataByClientId(
                    data,
                    node.clientId,
                    {hidden: visibility}
                )
            )
        }

    }, [visibility, previousVisibility]);

    const insertColumn = (clientId) => {
        const newData = addBlockInsideClientId(
            data,
            clientId,
            BlockManager.getBlockByType(blockType.COLUMN).init({
                clientId: uuidv4()
            })
        );

        addBlock(newData)
    }

    const putInWrapper = (node) => {
        const newData = wrapSectionInWrapper(
            data,
            node.clientId,
            node
        );
        addBlock(newData)
    }

    const insertSection = (clientId) => {
        const newData = addBlockInsideClientId(
            data,
            clientId,
            BlockManager.getBlockByType(blockType.SECTION).init({
                clientId: uuidv4(),
                children: [
                    BlockManager.getBlockByType(blockType.COLUMN).init({
                        clientId: uuidv4()
                    })
                ]
            })
        );

        addBlock(newData)
    }

    const createPattern = (node) => {
        setModal({
            className: "modal-full-h",
            title: __('Save as pattern', 'mailerpress'),
            size: 'small',
            component: <CreatePatternModal node={node}/>
        })
    }

    const renderIcon = () => {
        let icon = null;

        if (node.id !== undefined) {
            icon = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false" style="fill: currentcolor;"><path d="M21.3 10.8l-5.6-5.6c-.7-.7-1.8-.7-2.5 0l-5.6 5.6c-.7.7-.7 1.8 0 2.5l5.6 5.6c.3.3.8.5 1.2.5s.9-.2 1.2-.5l5.6-5.6c.8-.7.8-1.9.1-2.5zm-1 1.4l-5.6 5.6c-.1.1-.3.1-.4 0l-5.6-5.6c-.1-.1-.1-.3 0-.4l5.6-5.6s.1-.1.2-.1.1 0 .2.1l5.6 5.6c.1.1.1.3 0 .4zm-16.6-.4L10 5.5l-1-1-6.3 6.3c-.7.7-.7 1.8 0 2.5L9 19.5l1.1-1.1-6.3-6.3c-.2 0-.2-.2-.1-.3z"></path></svg>
            `
        } else {
            const block = BlockManager.getBlockByType(node.type)
            icon = block ? block.icon : null
        }

        return icon
    }

    const onDragStart = (event, node) => {
        event.stopPropagation()
        const blockType = node.type
        document.querySelector('.preview-block').style.visibility = 'hidden'
        document.querySelector('.preview-block').innerHTML = ''
        const originalNode = event.target;
        const id = node.id;
        let blockDragged = null;

        if (blockType === 'pattern' || blockType === blockTypeEnum.QUERY_PATTERN) {
            blockDragged = BlockManager.getPatternById(id);
        } else {
            blockDragged = BlockManager.getBlockByType(blockType);
        }

        console.log('TOTO', id)

        setDragElement({
            clientId: node.clientId,
            blockDragged
        })

        const clonedNode = document.createElement('div');
        clonedNode.insertAdjacentHTML('afterbegin', `
        <div style="display:flex; align-items: center; gap: 4px">
            <span style="fill: white; display: flex;">${blockDragged.icon}</span>
            <span style="font-size: 12px; text-transform: uppercase; letter-spacing:1.1">${blockDragged.name}</span>
        </div>
    `);
        clonedNode.style.position = 'absolute';
        clonedNode.style.pointerEvents = 'none';
        clonedNode.style.background = '#000';
        clonedNode.style.color = 'white';
        clonedNode.style.zIndex = '999999';
        clonedNode.style.padding = '8px 8px 8px 20px';
        clonedNode.style.borderRadius = '6px';
        clonedNode.style.boxShadow = '0px 10px 15px -3px rgba(0,0,0,0.1)';

        document.body.appendChild(clonedNode);

        const transparentDragImage = document.createElement('div');
        transparentDragImage.style.width = '1px';
        transparentDragImage.style.height = '1px';
        transparentDragImage.style.opacity = '0';
        document.body.appendChild(transparentDragImage);

        event.dataTransfer.setDragImage(transparentDragImage, 0, 0);

        // Position initiale du clone (dès le début du drag)
        clonedNode.style.left = `${event.pageX}px`;
        clonedNode.style.top = `${event.pageY}px`;

        // Suivre le mouvement de la souris
        document.addEventListener('dragover', (dragEvent) => {
            clonedNode.style.left = `${dragEvent.pageX}px`;
            clonedNode.style.top = `${dragEvent.pageY}px`;
        });


        originalNode.addEventListener('dragend', () => {
            clonedNode.remove();
            selectBlock(null);
            document.removeEventListener('dragover', null);
        });
    };

    const onDragEnd = () => {
        if (elementHovered) {
            const newData = BlockGenerator.move(
                findBlockInState(data, node.clientId),
                {
                    direction: elementHovered.direction,
                    selectedClientId: elementHovered.target.getAttribute('data-client-id'),
                    type: elementHovered.target.getAttribute('data-type')
                },
                data
            )

            addBlock(newData)
        }

        onDrop()
        setDragElement(null)
    }

    const DropLine = ({position}) => (
        <motion.div
            className="h-1 bg-blue-500 w-full absolute"
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            style={{top: position, height: 2, background: "red", position: 'absolute', width: '100%'}}
        />
    );

    return (
        <>
            <div
                className={cx({locked})}
                style={{paddingLeft: isChildren ? 10 : 0, marginTop: 6}}>

                <div
                    data-id={node.id}
                    data-type={node.type}
                    data-client-id={node.clientId}
                    data-lock={locked}
                    className={cx({
                        'tree-item': true,
                        'tree-item--is-dragged': dragElement && dragElement.clientId === node.clientId,
                        'selected': selectedBlock && selectedBlock.block && selectedBlock.block.clientId === node.clientId
                    })}
                    style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 4}}>
                    {node.type !== 'page' && !locked &&
                        <div
                            className="tree-drag-handle"
                            draggable
                            onDragStart={(e) => onDragStart(e, node)}
                            onDragEnd={onDragEnd}
                        >
                            <Icon icon={dragHandle}/>
                        </div>
                    }

                    <div style={{display: 'flex', alignItems: 'center', flex: 1}}>
                        {node.children && node.children.length > 0 && (
                            <span onClick={handleToggle} style={{display: 'flex'}}>
                        {isExpanded ? <Icon icon={chevronDownSmall}/> : <Icon icon={chevronRightSmall}/>}
                    </span>
                        )}
                        <span style={{display: 'flex', marginRight: 6}}
                              dangerouslySetInnerHTML={{__html: renderIcon()}}/>
                        <Text isBlock={true} style={{width: '100%'}} weight={"500"}
                              onClick={() => selectBlock(node.clientId)}>
                            {getName()}
                        </Text>
                    </div>
                    {node.type !== 'page' && locked &&
                        <Icon icon={lockOutline}/>
                    }
                    {node.type !== 'page' && !locked &&
                        <>
                            <Button onClick={() => setVisibility(!visibility)} icon={!visibility ? seen : unseen}/>
                            <span
                                className={"more"}
                                onClick={() => setPopover(popover === node.clientId ? null : node.clientId)}
                                style={{display: 'flex'}}
                            >
                        <Icon icon={moreVertical}/>
                                {popover && (popover === node.clientId) &&
                                    <Popover
                                        onFocusOutside={e => {
                                            setPopover(null)
                                        }}
                                        position={"middle top right"}
                                        offset={10}
                                    >
                                        <div style={{padding: 4}}>
                                            <MenuGroup>
                                                {[blockType.SECTION, blockType.WRAPPER].includes(node.type) && <>
                                                    {getPathToRoot(data, node.clientId).find(p => p.type === 'wrapper') ? null :
                                                        <MenuItem onClick={() => putInWrapper(node)}>
                                                            {__('Put in a wrapper', 'mailerpress')}
                                                        </MenuItem>
                                                    }
                                                    <MenuItem onClick={() => insertColumn(node.clientId)}>
                                                        {__('Add column', 'mailerpress')}
                                                    </MenuItem>
                                                    <MenuItem onClick={() => createPattern(node)} icon={symbol}>
                                                        {__('Create pattern', 'mailerpress')}
                                                    </MenuItem>
                                                </>
                                                }
                                                {node.type === blockType.WRAPPER &&
                                                    <MenuItem onClick={() => insertSection(node.clientId)}>
                                                        {__('Add section', 'mailerpress')}
                                                    </MenuItem>
                                                }
                                                {node.type === blockType.QUERY &&
                                                    <MenuItem onClick={() => alert()}>
                                                        {__('Change pattern', 'mailerpress')}
                                                    </MenuItem>
                                                }
                                                <MenuItem
                                                    onClick={() => duplicateBlock(node.clientId)}>
                                                    {__('Duplicate', 'mailerpress')}
                                                </MenuItem>
                                                <MenuItem
                                                    isDestructive
                                                    onClick={() => deleteBlock(node.clientId)}>
                                                    Delete
                                                </MenuItem>
                                            </MenuGroup>
                                        </div>
                                    </Popover>}
                            </span>
                        </>
                    }
                </div>
                {isExpanded && node.children && node.children.length > 0 && (
                    <div>
                        {node.children.map((child) => (
                            child &&
                            <TreeNode
                                onDrop={onDrop}
                                elementHovered={elementHovered}
                                dragElement={dragElement}
                                setDragElement={setDragElement}
                                isChildren={true}
                                key={child.clientId}
                                node={child}
                                expandedNodes={expandedNodes}
                                setExpandedNodes={setExpandedNodes}
                                popover={popover}
                                setPopover={setPopover}
                            />
                        ))}
                    </div>
                )}
            </div>

        </>
    )
        ;
};

export default TreeNode;
