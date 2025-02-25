import {merge} from "lodash";
import {registerPattern} from "../../regisetBlockType.ts";
import {getPreviewClassName} from "../../../utils/getAdapterAttributesString.ts";
import BlockPreview from "../../BlockPreview.tsx";
import useBlockParams from "../../../hooks/useBlockParams.ts";
import BlockRenderer from "../../BlockRenderer.tsx";
import classNames from "classnames";
import {Column, Section, Text, Button, Wrapper} from "../../components";
import {deepMerge} from "../../../utils/style.ts";

const Edit = (props) => {
    //const {block, edit} = useBlockParams({...props})
   // const {attributes, data} = block
}

const Preview = ({block}) => {
    let {attributes, data} = block
    return (
            <Section  css-class={
                classNames(
                    getPreviewClassName(block.clientId ?? ''),
                    attributes['css-class']
                )
            } padding="0px" full-width="full-width">
                <Column>
                    <Text align={"center"} font-size={'30px'}>Title</Text>
                </Column>
            </Section>
    )
}

registerPattern({
    icon: '',
    category: 'core/call-to-action',
    name: "Demo 2",
    attributes: {},
    init: (payload) => {
        const defaultData = {
            attributes: {
            },
            data: {
            }
        }

        return merge(payload, defaultData)
    },
    edit: props => <BlockPreview render={Edit} {...props} />,
    preview: props => <BlockRenderer render={Preview} {...props} />,
})