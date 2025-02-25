import {registerBlockType} from "../../regisetBlockType.ts";
import BasicBlock from "../../../components/BasicBlock.tsx";
import {blockType} from "../../../constants.ts";
import {merge} from "lodash";
import {Button, Panel, PanelBody} from "@wordpress/components";
import {
    BorderBox,
    ColorControl,
    InputControl,
    PaddingControl,
    FontSize,
    AlignControl,
    InnerPadding,
    BorderRadius, WidthHeight
} from "../../../UI/Settings/index.ts";
import {editBorder} from "../../../utils/function.ts";

const preview = (params) => {
    return <BasicBlock params={params} tag="mj-button">
        {params.data.content}
    </BasicBlock>;
}

const edit = (props) => {

    return (
        <Panel>
            <PanelBody title="Configuration">
                <InputControl {...props} label="Text"/>
                <InputControl {...props} label="URL"/>
                <AlignControl {...props} label="Align"/>
                <InnerPadding {...props} />
                <PaddingControl {...props} label="Padding"/>
            </PanelBody>
            <PanelBody title="Dimension">
                <WidthHeight {...props} />
            </PanelBody>
            <PanelBody title="Typographie">
                <FontSize {...props} />
            </PanelBody>
            <PanelBody title="Design">
                <ColorControl {...props} attrs={['color', 'background-color', 'container-background-color']}/>
                <BorderRadius {...props} label={"Border radius"}/>
                <BorderBox
                    clientId={props.block.clientId}
                    attributes={props.block.attributes}
                    onEdit={val => editBorder(val, props.setAttributes)}
                />
            </PanelBody>
        </Panel>
    )
}

registerBlockType({
    type: blockType.NAVBAR,
    edit,
    icon: `
<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24" aria-hidden="true" focusable="false"><path d="M12 4c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 14.5c-3.6 0-6.5-2.9-6.5-6.5S8.4 5.5 12 5.5s6.5 2.9 6.5 6.5-2.9 6.5-6.5 6.5zM9 16l4.5-3L15 8.4l-4.5 3L9 16z"></path></svg>`,
    preview: (params) => {
        const {data} = params;
        const elements = (data).links
            .map((link, index) => {
                const linkAttributeStr = Object.keys(link)
                    .filter((key) => key !== 'content' && link[key as keyof typeof link] !== '') // filter att=""
                    .map((key) => `${key}="${link[key as keyof typeof link]}"`)
                    .join(' ');
                return `
          <mj-navbar-link ${linkAttributeStr}>${link.content}</mj-navbar-link>
          `;
            })
            .join('\n');
        return <BasicBlock params={params} tag="mj-navbar">{elements}</BasicBlock>;
    },
    disabledBlockType:
        [],
    name: "Navigation",
    init: (payload) => {
        const defaultData = {
            'type': blockType.NAVBAR,
            'data': {
                links: [
                    {
                        href: '/gettings-started-onboard',
                        content: 'Getting started',
                        color: '#1890ff',
                        'font-size': '13px',
                        target: '_blank',
                        padding: '15px 10px',
                    },
                    {
                        href: '/try-it-live',
                        content: 'Try it live',
                        color: '#1890ff',
                        'font-size': '13px',
                        target: '_blank',
                        padding: '15px 10px',
                    },
                    {
                        href: '/templates',
                        content: 'Templates',
                        color: '#1890ff',
                        'font-size': '13px',
                        target: '_blank',
                        padding: '15px 10px',
                    },
                    {
                        href: '/components',
                        content: 'Components',
                        color: '#1890ff',
                        'font-size': '13px',
                        target: '_blank',
                        padding: '15px 10px',
                    },
                ],
            },
            attributes: {
                align: 'center',
            },
            children: [],
        }
        return merge(defaultData, payload)
    }
})