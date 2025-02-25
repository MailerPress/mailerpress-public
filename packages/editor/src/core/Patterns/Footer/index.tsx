import {merge} from "lodash";
import {registerPattern} from "../../regisetBlockType.ts";
import {Section} from "../../components/Section.tsx";
import {Column} from "../../components/Column.tsx";
import {Text} from "../../components/Text.tsx";
import {Button} from "../../components/Button.tsx";
import {FontSizePicker, Panel, PanelBody} from "@wordpress/components";
import {getPreviewClassName} from "../../../utils/getAdapterAttributesString.ts";
import {ColorControl, InputControl} from "../../../UI/Settings/index.ts";
import React from "react";
import {classnames} from "../../../utils/classnames.ts";
import {Group, Image, Spacer, Wrapper} from "../../components/index.ts";
import {__} from "@wordpress/i18n";

registerPattern({
    lock: true,
    icon: null,
    internal: true,
    category: '',
    name: "Footer email",
    attributes: {},
    init: (payload) => {
        const defaultData = {
            attributes: {
                'font-size': '10px',
            },
            data: {
                lock: true,
                content: __('Vous recevez ce message car vous êtes inscrits à la newsletter.','mailerpress'),
                unscubcribeText: __('Unsubscribe','mailerpress'),
                manageSubscriptionText: __('Manage subscription','mailerpress'),
            }
        }

        return merge(payload, defaultData)
    },
    edit: (props) => {
        return (
            <Panel>
                <PanelBody title="Contenu">
                    <InputControl
                        {...props}
                        label={__('Slogan','mailerpress')}
                        value={props.block.data.content}
                        onChange={text => props.setData({content: text})}
                    />
                    <InputControl
                        {...props}
                        label={__('Unsubscribe text','mailerpress')}
                        value={props.block.data.unscubcribeText}
                        onChange={text => props.setData({unscubcribeText: text})}

                    />
                    <InputControl
                        {...props}
                        label={__('Manage subscription text','mailerpress')}
                        value={props.block.data.manageSubscriptionText}
                        onChange={text => props.setData({manageSubscriptionText: text})}

                    />
                </PanelBody>
                <PanelBody title="Typography">
                    <FontSizePicker
                        withReset={false}
                        withSlider={true}
                        fontSizes={[
                            {
                                name: 'Small',
                                size: '8px',
                                slug: 'small'
                            },
                            {
                                name: 'Normal',
                                size: '10px',
                                slug: 'normal'
                            },
                            {
                                name: 'Big',
                                size: '16px',
                                slug: 'big'
                            }
                        ]}
                        onChange={(val) => props.setAttributes({'font-size': val})}
                        value={props.block.attributes['font-size']}
                    />
                </PanelBody>
                <PanelBody title="Styles">
                    <ColorControl {...props} attrs={['background-color', 'color']}/>
                </PanelBody>
            </Panel>
        )
    },
    preview: (block) => {
        const {attributes, data, previewMode} = block
        const BuiltWithNotice = () => {
            const content = wp.hooks.applyFilters('render-built-with', <Section
                    padding-top="0px"
                    padding-bottom="20px"
                    padding-right="0px"
                    padding-left="0px"
                >
                    <Column
                    >
                        <Spacer height={'8px'}/>
                        <Button
                            background-color={'#fff'}
                            href="https://mailerpress.com"
                            padding-top="0px"
                            padding-bottom="0px"
                            padding-right="0px"
                            padding-left="0px"
                            align={"center"}
                            font-size={attributes['font-size']}
                            border-radius={"8px"}
                            inner-padding={'4px 8px 4px 8px'}
                            color={"#000"}
                        >
                            <table>
                                <tr>
                                    <td>
                                        <img width="20"
                                             src="https://mailerpress.com/wp-content/themes/gutty-child/assets/img/icons/favicon-96x96.png"
                                             style="width:20px;vertical-align:middle;margin-right: 4px"/>
                                    </td>
                                    <td style={`font-size:${attributes['font-size']}`}>
                                        {__('Made with MailerPress', 'mailerpress')}
                                    </td>
                                </tr>
                            </table>
                        </Button>
                    </Column>
                </Section>
            );

            return content;
        }

        return (
            <Wrapper
                padding-top="10px"
                padding-bottom="0px"
                padding-right="0px"
                padding-left="0px"
                css-class={
                    classnames(
                        getPreviewClassName(block.clientId ?? ''),
                        `pattern-footer`,
                        'lock-inline-editing'
                    )
                }>
                {previewMode !== 'builder' &&
                    <Section
                        css-class='hidden'
                        padding-top="0px"
                        padding-bottom="0px"
                        padding-right="0px"
                        padding-left="0px"
                    >
                        <Column>
                            <Image
                                src="%TRACK_OPEN%"
                                width="1px" height="1px"/>
                        </Column>
                    </Section>
                }
                <Section
                    padding-top="0px"
                    padding-bottom="0px"
                    padding-right="0px"
                    padding-left="0px"
                    background-color={attributes['background-color']}
                    padding="0px"
                >
                    <Column>
                        <Text
                            color={attributes.color}
                            padding-top="0px"
                            padding-bottom="4px"
                            padding-right="0px"
                            padding-left="0px"
                            align={"center"}
                            font-size={attributes['font-size']}
                        >
                            {data.content}
                        </Text>
                    </Column>
                </Section>

                <Section text-align={"center"} padding-bottom="0px" padding-top={"0px"}>
                    <Group>
                        <Column>
                            <Button
                                css-class="mailerpress-button-link"
                                href={previewMode === 'builder' ? '#' : "%UNSUB_LINK%"}
                                text-decoration={"underline"}
                                padding-top="4px"
                                padding-right="6px"
                                padding-bottom="0px"
                                padding-left="0px"
                                inner-padding={"0px"}
                                align={"right"}
                                font-size={'10px'}
                                background-color={"transparent"}
                                color={attributes.color}
                            >
                                {data.unscubcribeText}
                            </Button>
                        </Column>
                        <Column>
                            <Button
                                css-class="mailerpress-button-link"
                                href={previewMode === 'builder' ? '#' : "%MANAGE_SUB_LINK%"}
                                text-decoration={"underline"}
                                padding-top="4px"
                                padding-bottom="0px"
                                padding-right="0px"
                                padding-left="0px"
                                inner-padding={"0px"}
                                align={"left"}
                                font-size={'10px'}
                                background-color={"transparent"}
                                color={attributes.color}
                            >
                                {data.manageSubscriptionText}
                            </Button>
                        </Column>
                    </Group>
                </Section>

                <BuiltWithNotice/>
            </Wrapper>

        )
    },
})