import {useCallback, useContext, useState} from 'react';
import {HoverIdxContext} from '@/components/Provider/HoverIdxProvider';
import {debounce} from 'lodash';

export function useHover() {
    const [hoverIdx, setHoverIdx] = useState(null);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const setHoverIdxDebounce = useCallback(debounce(setHoverIdx), [setHoverIdx]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    // const setDirectionDebounce = useCallback(debounce(setDirection), [
    //     setDirection,
    // ]);

    return {
        hoverIdx,
        setHoverIdx,
        // isDragging,
        // setIsDragging,
        // direction,
        // setDirection: setDirectionDebounce,
    };
}
