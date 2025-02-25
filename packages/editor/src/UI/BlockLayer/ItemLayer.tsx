import React from "react"
import BlockManager from "../../core/BlockManager.ts";
import {__experimentalText as Text, Button} from "@wordpress/components";
import cx from "classnames/bind";
import {chevronRight, Icon} from "@wordpress/icons";
import Block from "../../interfaces/block.ts";
import {useDispatch, useSelect} from "@wordpress/data";
import {STORE_KEY} from "../../constants.ts";
import {findBlockInState, isChildClientId, isChildInSection, isChildOf, isChildOfClientId} from "../../utils/block.ts";

const RecursiveComponent = ({element, onSelect, selectedBlock, data, sectionId}) => {
    const blockType = BlockManager.getBlockByType(element.type)

    const isOpen = () => {
        if (selectedBlock === null || selectedBlock === undefined || selectedBlock.block === null) {
            return false
        }

        return isChildInSection(data, selectedBlock.block.clientId, sectionId)
    }

    if (!element.children || element.children.length === 0) {
        // Si l'élément n'a pas d'enfants, on renvoie juste lui-même
        return <div className={cx({
            "item-layer": true,
            "item-layer__open": isOpen(element),
            "item-layer__selected": selectedBlock && selectedBlock.block ? element.clientId === selectedBlock.block.clientId : false,
        })} onClick={() => onSelect(element)}>
            <Text>{blockType.name}</Text>
        </div>;
    } else {
        // Si l'élément a des enfants, on les parcourt récursivement
        return (
            <div>
                {/*{element.children.length > 0 && <Button icon={chevronRight}></Button> }*/}
                <div className={cx({
                    "item-layer": true,
                    "item-layer__open": isOpen(element),
                    "item-layer__has-child": element.children.length > 0,
                    "item-layer__selected": selectedBlock && selectedBlock.block ? element.clientId === selectedBlock.block.clientId : false,
                })} onClick={() => onSelect(element)}>
                    {element.children.length > 0 && <span className="chevron"
                                                          dangerouslySetInnerHTML={{__html: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><path d="M10.8622 8.04053L14.2805 12.0286L10.8622 16.0167L9.72327 15.0405L12.3049 12.0286L9.72327 9.01672L10.8622 8.04053Z"></path></svg>'}}/>}

                    <Text>{blockType.name}</Text>
                </div>
                <div style={{marginLeft: '20px', display: "flex", flexDirection: "column"}}>
                    {element.children.map((child, index) => (
                        <RecursiveComponent
                            sectionId={sectionId}
                            data={data}
                            selectedBlock={selectedBlock}
                            onSelect={onSelect}
                            key={index}
                            element={child}/>
                    ))}
                </div>
            </div>
        );
    }
};

const ItemLayer = ({block}) => {
    const blockType = BlockManager.getBlockByType(block.type)
    const {selectBlock} = useDispatch(STORE_KEY)

    const onSelect = (block: Block) => {
        if (selectedBlock && selectedBlock.block && selectedBlock.block.clientId === block.clientId) {
            selectBlock(null)
        } else {
            selectBlock(block.clientId)
        }
    }

    const {selectedBlock, data} = useSelect(select => {
        return {
            selectedBlock: select(STORE_KEY).getSelectedBlock(),
            data: select(STORE_KEY).getBlocks(),
        }
    }, [])

    const isOpen = (block) => {
        if (selectedBlock === null || selectedBlock === undefined || selectedBlock.block === null) {
            return false
        }

        return isChildInSection(block, selectedBlock.block.clientId, block.clientId)
    }

    return (
        <>

            <div
                style={{
                    marginLeft: 20
                }}
                onClick={() => onSelect(block)}
                className={cx({
                    "item-layer": true,
                    "item-layer__has-child": block.children.length > 0,
                    "item-layer__open": isOpen(block),
                    "item-layer__selected": selectedBlock && selectedBlock.block ? block.clientId === selectedBlock.block.clientId : false,
                })}>
                {block.children.length > 0 && <span className="chevron"
                                                    dangerouslySetInnerHTML={{__html: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><path d="M10.8622 8.04053L14.2805 12.0286L10.8622 16.0167L9.72327 15.0405L12.3049 12.0286L9.72327 9.01672L10.8622 8.04053Z"></path></svg>'}}/>}
                <Text>
                    {blockType.name}
                </Text>
            </div>
            <div style={{marginLeft: 40, display: isOpen(block) ? 'block' : "none"}}>
                {block.children.map((child, index) => (
                    <RecursiveComponent
                        sectionId={block.clientId}
                        onSelect={(block) => onSelect(block)}
                        data={block}
                        selectedBlock={selectedBlock}
                        key={index}
                        element={child}
                    />
                ))}
            </div>
        </>
    )
}
export default ItemLayer