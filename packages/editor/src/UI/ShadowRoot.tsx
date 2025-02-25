import {PropsWithChildren, useEffect, useState} from "react"
import {createPortal} from "react-dom";

const ShadowRoot = (props: PropsWithChildren) => {
    const [root, setRoot] = useState<null | ShadowRoot>(null);
    const [ref, setRef] = useState<null | HTMLDivElement>(null);

    useEffect(() => {
        if (ref) {
            const root = ref;
            setRoot(root);
            if (!ref.shadowRoot) return;
            return () => {
            };
        }
    }, [ref]);

    return (
        <>
            <div id={props.id} ref={setRef}>
                {root && createPortal(props.children, root)}
            </div>
        </>
    );
}
export default ShadowRoot