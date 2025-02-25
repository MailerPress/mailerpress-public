import React, {useEffect, useState} from 'react';
import TreeNode from './TreeNode.tsx';
import {useSelect, useDispatch} from "@wordpress/data";
import {STORE_KEY} from "../../constants.ts";
import {findPathToClientId} from "../../utils/block.ts";
import HoverToolTipTree from "../interactive-tooltip/HoverToolTipTree.tsx";
import {useDragDropLine} from "../../hooks/useDragDropLine.ts";

// Composant Tree pour afficher la structure de l'arbre entière
const Tree = ({data}) => {
    const {selectBlock} = useDispatch(STORE_KEY)
    const {selectedBlock} = useSelect(select => {
        return {
            selectedBlock: select(STORE_KEY).getSelectedBlock(),
        }
    }, [])

    const [dragElement, setDragElement] = useState(null)
    const [expandedNodes, setExpandedNodes] = useState(['page']);
    const [popover, setPopover] = useState(null);

    useEffect(() => {
        if (selectedBlock && selectedBlock.block) {
            setExpandedNodes(findPathToClientId(data, selectedBlock.block.clientId));
        }
    }, [selectedBlock]);

    const {elementHovered, onDragOver, onDrop} = useDragDropLine({dragElement, data})

    useEffect(() => {
    }, [dragElement]);

    return (
        <div className="tree">
            {elementHovered &&
                <HoverToolTipTree
                    dragElement={dragElement}
                    inserter={elementHovered}
                />}
            <div
                onDragOver={(e) => onDragOver(e)}
            >
                <TreeNode
                    onDrop={onDrop}
                    elementHovered={elementHovered}
                    setDragElement={setDragElement}
                    dragElement={dragElement}
                    node={data}
                    expandedNodes={expandedNodes}
                    setExpandedNodes={setExpandedNodes}
                    popover={popover}
                    setPopover={setPopover}
                />
            </div>

        </div>
    );
};

export default Tree;
