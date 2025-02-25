import {useState, useCallback} from 'react';
import {blockType as blockTypeEnum, blockType} from "../constants.ts";
import {
    contentBlocks,
    isChildOf,
} from "../utils/block.ts";

function getDirectionPosition(
    ev,
    dropHere,
    hovered,
    deviation = 10
) {
    const blockNode = ev.target;
    const position = {
        direction: '',
        isEdge: false,
    };

    if ('inside' === dropHere) {
        return {
            direction: 'inside',
            isEdge: false,
        }
    }

    if (!blockNode) {
        return position;
    }

    const {top, bottom, height} = blockNode.getBoundingClientRect();
    const mouseY = ev.clientY;

    // console.log('blockNode:', blockNode);
    // console.log('top:', top, 'bottom:', bottom, 'height:', height);
    // console.log('mouseY:', mouseY);

    if (
        blockType.PAGE === blockNode.getAttribute('data-type') ||
        (
            blockType.WRAPPER === blockNode.getAttribute('data-type') && (blockNode.getAttribute('data-type') !== blockType.WRAPPER)
        )
    ) {
        position.direction = 'inside';
    } else {
        // Check if mouseY is in the top or bottom half of the block
        if (mouseY <= top + height / 2) {
            position.direction = 'top';
            if (Math.abs(mouseY - top) <= deviation) { // Near the top edge
                position.isEdge = true;
            }
        } else {
            // console.log('Detected bottom');
            position.direction = 'bottom';
            if (Math.abs(mouseY - bottom) <= deviation) { // Near the bottom edge
                position.isEdge = true;
            }
        }
    }

    return position;
}

export const canDropBlockHere = (blockDraggedType, targetType) => {
    switch (blockDraggedType) {
        case blockType.WRAPPER:
            return [blockType.PAGE, blockType.WRAPPER, blockType.SECTION].includes(targetType)
        case blockType.SECTION:
            return [blockType.SECTION, blockType.WRAPPER, blockType.QUERY, blockType.PAGE].includes(targetType)
        case blockType.QUERY:
            return [blockType.SECTION, blockType.WRAPPER, blockType.PAGE].includes(targetType)
        case blockType.COLUMN:
            return [blockType.SECTION, blockType.COLUMN, blockType.PAGE, blockType.WRAPPER].includes(targetType)
        default:
            return true
    }
}

export function useDragDropLine({dragElement, data}) {
    const [dragging, setDragging] = useState(false);
    const [elementHovered, setElementHovered] = useState(null);

    const canDropHere = useCallback((target) => {
        const {type} = dragElement.blockDragged
        const blockDraggedClienId = dragElement.clientId
        const targetType = target.getAttribute('data-type')
        const targetClientId = target.getAttribute('data-client-id')
        if (
            isChildOf(targetClientId, blockDraggedClienId, data)
            && (
                !contentBlocks.includes(type) &&
                targetType !== blockTypeEnum.PAGE
            )
        ) {
            return false
        }


        if (blockDraggedClienId === targetClientId) {
            return false
        }


        if ((
            (
                [blockTypeEnum.COLUMN, blockTypeEnum.PAGE, blockTypeEnum.WRAPPER].includes(targetType) &&
                (targetType === blockTypeEnum.WRAPPER && type !== blockTypeEnum.WRAPPER)
            ) ||
            type !== targetType &&
            (
                targetType === blockTypeEnum.COLUMN && type !== blockTypeEnum.SECTION &&
                targetType === blockTypeEnum.COLUMN && type !== blockTypeEnum.QUERY &&
                targetType === blockTypeEnum.COLUMN && type !== blockTypeEnum.WRAPPER
            ) &&
            !contentBlocks.includes(targetType)
        )
        ) {
            return 'inside'
        }

        if (canDropBlockHere(type, targetType)) {
            return true
        }

        return false
    }, [dragElement]);

    const onDragOver = useCallback(ev => {
        ev.preventDefault();
        if (ev.target.classList?.contains('tree-item')) {
            const dropHere = canDropHere(ev.target)
            if (dropHere || 'inside' === dropHere && dragElement) {
                setElementHovered({
                    target: ev.target,
                    ...getDirectionPosition(ev, dropHere, dragElement.blockDragged.type)
                })
            } else {
                setElementHovered(null)
            }

        }
    }, [dragElement, data]);

    const onDrop = useCallback((ev) => {
        setElementHovered(null)
        // Implement logic here for positioning the block based on clientY
    }, []);

    return {dragging, elementHovered, onDragOver, onDrop};
}