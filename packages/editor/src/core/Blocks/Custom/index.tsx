import {registerBlockType} from "../../regisetBlockType.ts";
import BasicBlock from "../../../components/BasicBlock.tsx";
import {blockType} from "../../../constants.ts";
import { merge } from "lodash";
import {MjmlToJson} from "../../../utils/MjmlToJson.ts";
import {BlockRenderer} from "../../../components/BlockRenderer.tsx";

const preview = (params) => {
    const {attributes} = params

    const instance = MjmlToJson(
        ` <mj-section>
      <mj-column>

        <mj-image width="100px" src="/assets/img/logo-small.png"></mj-image>

        <mj-divider border-color="#F45E43"></mj-divider>

        <mj-text font-size="20px" color="#F45E43" font-family="helvetica">Hello World</mj-text>

      </mj-column>
    </mj-section>`,
    );

    return <BlockRenderer data={instance} />;
}

const edit = () => {
    return (
        <div>Edit</div>
    )
}

registerBlockType({
    type: 'custom',
    edit,
    icon: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24" aria-hidden="true" focusable="false"><path d="M4.5 12.5v4H3V7h1.5v3.987h15V7H21v9.5h-1.5v-4h-15Z"></path></svg>    `,
    preview,
    disabledBlockType: [],
    name: "Custom",
    init: (payload) => {
        const defaultData = {
            'type':  'custom',
            'data': {
            },
            attributes: {
            },
            children: [],
        }
        return merge(defaultData, payload)
    }
})