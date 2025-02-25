import Block from "../interfaces/block.ts";

export const getEditorRoot = () => document.getElementById('editor-root');

interface Params {
    context: { content: IPage };
    idx: string;
    directionPosition: DirectionPosition;
    dragType: string;
}

export const getBlockNodeByChildEle = (
    target?: Element | null
): HTMLElement | null => {
    if (!target) return null;

    if (target.classList?.contains('email-block')) {

        if(target.closest('.block-pattern')) {
            return target.closest('.block-pattern') as HTMLElement
        }
        return target as HTMLElement;
    }
    if (target.parentNode) {
        return getBlockNodeByChildEle(target.parentNode as HTMLElement);
    }
    return null;
};

export type DirectionPosition = {
    horizontal: {
        direction: string;
        isEdge: boolean;
    };
    vertical: {
        direction: string;
        isEdge: boolean;
    };
};

export function getDirectionPosition(
    ev: {
        target: EventTarget | null;
        clientY: number;
        clientX: number;
    },
    deviation = 10
): DirectionPosition {
    const target = ev.target as HTMLElement;
    const blockNode = getBlockNodeByChildEle(target);
    const position = {
        horizontal: {
            direction: '',
            isEdge: false,
        },
        vertical: {
            direction: '',
            isEdge: false,
        },
    };
    if (!blockNode) return position;
    const {top, height, left, width} = blockNode.getBoundingClientRect();

    const mouseY = ev.clientY;
    const mouseX = ev.clientX;

    if (mouseY - top <= 0.5 * height) {
        position.vertical.direction = 'top';
        if (Math.abs(top - mouseY) <= deviation) {
            position.vertical.isEdge = true;
        }
    } else {
        position.vertical.direction = 'bottom';
        if (Math.abs(top + height - mouseY) <= deviation) {
            position.vertical.isEdge = true;
        }
    }

    if (mouseX - left <= 0.5 * width) {
        position.horizontal.direction = 'left';
        if (Math.abs(left - mouseX) <= deviation) {
            position.horizontal.isEdge = true;
        }
    } else {
        position.horizontal.direction = 'right';

        if (Math.abs(left + width - mouseX) <= deviation) {
            position.horizontal.isEdge = true;
        }
    }

    return position;
}

export type IRecord = Record<"type" | "clientId", string> | null
export const getNodeInfoByClassName = (node: HTMLElement): IRecord => {
    const classListArray = node.getAttribute('class')?.split(' ')
    const type = classListArray?.find(c => c.startsWith('node-type'))
    const clientId = classListArray?.find(c => c.startsWith('node-client'))

    if (type !== undefined && clientId !== undefined) {
        return {
            type: type.replace('node-type-', ''),
            clientId: clientId.replace('node-client-', '')
        }
    }

    return null;
}