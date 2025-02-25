import {registerBlockType} from "../../regisetBlockType.ts";
import BasicBlock from "../../../components/BasicBlock.tsx";
import {blockType} from "../../../constants.ts";
import {merge} from "lodash";
import {PanelBody} from "@wordpress/components";
import {ColorControl, HeightControl, PaddingControl} from "../../../UI/Settings/index.ts";

const preview = (params) => {
    return <BasicBlock params={params} tag="mj-spacer">
        {params.data.content}
    </BasicBlock>;
}

const edit = (props) => {
    return (
        <PanelBody title={"Configuration"}>
            <HeightControl {...props} />
            <ColorControl {...props} attrs={['container-background-color']}/>
            <PaddingControl {...props}/>
        </PanelBody>
    )
}

registerBlockType({
    type: blockType.SPACER,
    description: "Add white space between blocks and customize its height.",
    edit,
    icon: `
<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24" aria-hidden="true" focusable="false"><path d="M7 18h4.5v1.5h-7v-7H6V17L17 6h-4.5V4.5h7v7H18V7L7 18Z"></path></svg>
    `,
    preview,
    disabledBlockType: [],
    name: "Spacer",
    init: (payload) => {
        const defaultData = {
            'type': blockType.SPACER,
            'data': {},
            attributes: {
                height: '20px'
            },
            children: [],
        }
        return merge(defaultData, payload)
    }
})