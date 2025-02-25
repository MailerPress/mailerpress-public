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
import {Column, Section, Text, Wrapper} from "../../components";
import {getPreviewClassName} from "../../../utils/getAdapterAttributesString.ts";

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
    type: blockType.SOCIAL,
    edit,
    icon: `
<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24" aria-hidden="true" focusable="false"><path d="M9 11.8l6.1-4.5c.1.4.4.7.9.7h2c.6 0 1-.4 1-1V5c0-.6-.4-1-1-1h-2c-.6 0-1 .4-1 1v.4l-6.4 4.8c-.2-.1-.4-.2-.6-.2H6c-.6 0-1 .4-1 1v2c0 .6.4 1 1 1h2c.2 0 .4-.1.6-.2l6.4 4.8v.4c0 .6.4 1 1 1h2c.6 0 1-.4 1-1v-2c0-.6-.4-1-1-1h-2c-.5 0-.8.3-.9.7L9 12.2v-.4z"></path></svg>    `,
    preview: (params) => {
        const {data} = params;
        const elements = (data).elements
            .map((element) => {
                const elementAttributeStr = Object.keys(element)
                    .filter((key) => key !== 'content' && element[key as keyof typeof element] !== '') // filter att=""
                    .map((key) => `${key}="${element[key as keyof typeof element]}"`)
                    .join(' ');
                return `
          <mj-social-element ${elementAttributeStr}>${element.content}</mj-social-element>
          `;
            })
            .join('\n');
        return <BasicBlock params={params} tag="mj-social">{elements}</BasicBlock>;
    },
    disabledBlockType:
        [],
    name: "Social",
    init: (payload) => {
        const defaultData = {
            'type': blockType.SOCIAL,
            'data': {
                elements: [
                    {
                        href: '#',
                        target: '_blank',
                        src: 'https://easy-email-m-ryan.vercel.app/images/acbae5eb-efa4-4eb6-866c-f421e740b713-ad3c92b1-9cdb-4a7b-aad3-75ad809db8a3.png',
                        content: 'Facebook',
                    },
                    {
                        href: '#',
                        target: '_blank',
                        src: 'https://easy-email-m-ryan.vercel.app/images/98520d6c-5cef-449e-bcbf-6316ccec2088-e8780361-0deb-4896-895e-e690c886cdf0.png',
                        content: 'Google',
                    },
                    {
                        href: '',
                        target: '_blank',
                        src: 'https://easy-email-m-ryan.vercel.app/images/b064f705-34ba-4400-975e-9dd0cec21c30-cc9aa158-56bd-4bf1-b532-72390d25c864.png',
                        content: 'Twitter',
                    },
                ],
            },
            attributes: {
                align: 'center',
                color: '#333333',
                mode: 'horizontal',
                'font-size': '13px',
                'font-weight': 'normal',
                'border-radius': '3px',
                padding: '10px 25px 10px 25px',
                'inner-padding': '4px 4px 4px 4px',
                'line-height': '22px',
                'text-padding': '4px 4px 4px 0px',
                'icon-padding': '0px',
                'icon-size': '20px',
            },
            children: [],
        }
        return merge(defaultData, payload)
    }
})