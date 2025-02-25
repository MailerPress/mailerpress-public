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
        <Wrapper
            css-class={
                classNames(
                    getPreviewClassName(block.clientId ?? ''),
                    attributes['css-class']
                )
            }
            padding='20px 0px 20px 0px'
            border='none'
            direction='ltr'
            text-align='center'
            background-color={attributes['background-color']}
        >
            <Section padding="0px" full-width="full-width">
                <Column>
                    <Text align={"center"} font-size={'30px'}>Title</Text>
                    <Button background-color={"blue"}>Hello world</Button>
                </Column>
            </Section>
            <Section full-width="full-width">
                {block.data.post.map(p => <Column background-color="blue">
                    <Text align={"center"}>{p}</Text>
                </Column>)}
            </Section>
        </Wrapper>
    )
}

registerPattern({
    icon: '',
    category: 'core/call-to-action',
    name: "Demo Pattern",
    attributes: {},
    init: (payload) => {
        const defaultData = {
            attributes: {
                'background-color': "red"
            },
            data: {
                post: ['Hello', 'lala', 'world']
            }
        }

        return merge(payload, defaultData)
    },
    edit: props => <BlockPreview render={Edit} {...props} />,
    preview: props => <BlockRenderer render={Preview} {...props} />,
})