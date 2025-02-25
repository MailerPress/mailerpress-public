import {merge} from "lodash";
import {registerQueryPattern} from "../../../regisetBlockType.ts";
import {Section, Text, Column, Image, Button, Wrapper, Heading} from "../../../components/index.ts";
import {getPreviewClassName} from "../../../../utils/getAdapterAttributesString.ts";
import {__} from "@wordpress/i18n";
import React from "react";
import {Panel, PanelBody} from "@wordpress/components";
import {
    ColorControl,
    FontSize, PaddingControl,
} from "../../../../UI/Settings/index.ts";
import BlockPreview from "../../../BlockPreview.tsx";
import useBlockParams from "../../../../hooks/useBlockParams.ts";
import BlockRenderer from "../../../BlockRenderer.tsx";
import classNames from "classnames";

const Edit = (props) => {
    const {block, edit} = useBlockParams({...props})
    const {attributes, data} = block

    return <Panel>
        <PanelBody title={__('Title','mailerpress')}>
            <FontSize
                {...props}
                value={attributes.titleSize}
                onChange={(val) => edit({titleSize: val})}
            />
            <div style={{marginTop: 16}}>
                <PaddingControl
                    {...props}
                    label="Padding"
                    value={attributes.titlePadding}
                    onChange={nextValues => edit({titlePadding: nextValues})}
                />
            </div>
        </PanelBody>
        <PanelBody title={__('Description','mailerpress')}>
            <FontSize
                {...props}
                value={attributes.descriptionSize}
                onChange={(val) => edit({descriptionSize: val})}
            />
        </PanelBody>
        <PanelBody title={__('Button','mailerpress')}>
            <ColorControl
                {...props}
                block={block}
                attrs={['color', 'background-color']}
                onChange={(val, attr) => edit({[attr]: val})}
            />
        </PanelBody>
        <PanelBody title={__('Image','mailerpress')}>
            <PaddingControl
                {...props}
                label="Padding"
                value={attributes.imagePadding}
                onChange={nextValues => edit({imagePadding: nextValues})}
            />
        </PanelBody>
    </Panel>
}

const Preview = ({block}) => {
    let {attributes, data} = block

    if (data.posts === undefined) {
        return null
    }

    const rows = [];
    for (let i = 0; i < data.posts.length; i += data.columnSize) {
        rows.push(data.posts.slice(i, i + data.columnSize));
    }

    return (
        <>
            {
                data.posts && data.posts.length === 0 &&
                <Section
                    css-class={classNames(
                        getPreviewClassName(block.clientId ?? ''),
                        attributes['css-class']
                    )}>
                    <Column>
                        <Text color={"red"} align={"center"}>Empty listing</Text>
                    </Column>
                </Section>
            }

            {
                data.posts && data.posts.length > 0 && data.displayMode === 'column' &&

                data.posts.map(p =>
                    <Section
                        padding-top={"0px"}
                        padding-left={"0px"}
                        padding-right={"0px"}
                        padding-bottom={"20px"}
                        css-class={classNames(
                            getPreviewClassName(block.clientId ?? ''),
                            attributes['css-class'],
                        )}
                    >
                        <Column width={'65%'} vertical-align={"top"}>
                            <Heading
                                padding-left={attributes.titlePadding.left}
                                padding-right={attributes.titlePadding.right}
                                padding-bottom={attributes.titlePadding.bottom}
                                padding-top={'0px'}
                                font-size={`${attributes.titleSize}`}
                                line-height={`${parseInt(attributes.titleSize.replace('px', '')) + 8}px`}
                            >
                                {p.title.rendered.replace(/<\/?p>/g, '')}
                            </Heading>
                            {p.excerpt.rendered &&
                                <Text
                                    padding-left={attributes.titlePadding.left}
                                    padding-right={attributes.titlePadding.right}
                                    padding-bottom={attributes.titlePadding.bottom}
                                    padding-top={attributes.titlePadding.top}
                                    font-size={`${attributes.descriptionSize}`}
                                >
                                    {p.excerpt.rendered.replace(/<\/?p>/g, '')}
                                </Text>
                            }
                            <Button
                                background-color={attributes['background-color']}
                                href={p.link}
                            >
                                Read more
                            </Button>
                        </Column>
                        <Column width={'35%'} vertical-align={"top"}>
                            <Image
                                padding-left={attributes.imagePadding.left}
                                padding-right={attributes.imagePadding.right}
                                padding-bottom={attributes.imagePadding.bottom}
                                padding-top={attributes.imagePadding.top}
                                href={p.link}
                                align={"right"}
                                fluid-on-mobile="true"
                                src={p.images && p.images?.medium ? p.images.medium : "https://placehold.co/1280x800/png"}
                            />
                        </Column>
                    </Section>
                )
            }

            {
                data.posts && data.posts.length > 0 && data.displayMode === 'grid' &&

                rows.map((row, rowIndex) => (
                    <Section
                        padding-top={"0px"}
                        padding-left={"0px"}
                        padding-right={"0px"}
                        padding-bottom={"0px"}
                        css-class={classNames(
                            getPreviewClassName(block.clientId ?? ''),
                            attributes['css-class'],
                        )}
                    >
                        {row.map((post, colIndex) => (
                            <Column
                                padding-right={'8px'}
                                padding-left={'8px'}
                                padding-bottom={'0px'}
                                padding-top={'0px'}
                                key={colIndex} vertical-align={"top"}
                            >
                                <Image
                                    href={post.link}
                                    align={"center"}
                                    fluid-on-mobile={"true"}
                                    src={post.images && post.images?.medium ? post.images.medium : "https://placehold.co/1280x800/png"}
                                />

                                <Text
                                    align={"center"}
                                    font-size={'23px'}
                                    font-weight={'bold'}
                                    padding-top="8px"
                                    padding-bottom="0px"
                                    padding-left={"0px"}
                                    padding-right={"0px"}
                                >
                                    {post.title.rendered.replace(/<\/?p>/g, '')}
                                </Text>
                                {post.excerpt.rendered &&
                                    <Text
                                        align={"center"}
                                        padding-bottom="0px"
                                        font-size={'14px'}
                                        font-weight={'normal'}
                                        padding-top="0px"
                                        padding-left={"0px"}
                                        padding-right={"0px"}>
                                        {post.excerpt.rendered.replace(/<\/?p>/g, '')}
                                    </Text>
                                }
                                <Button
                                    background-color={attributes['background-color']}
                                    href={post.link}
                                    align={"center"}
                                    padding-bottom="30px"
                                    padding-top="10px"
                                    padding-left="0px"
                                    padding-right="0px"
                                >
                                    {__('Read more', 'mailerpress')}
                                </Button>
                            </Column>
                        ))}
                    </Section>
                ))
            }
        </>
    )

}

registerQueryPattern({
    id: "default",
    name: "Text / image on right",
    description: 'default desc',
    init: (payload) => {
        const defaultData = {
            attributes: {
                titleSize: '30px',
                descriptionSize: '13px',
                imagePadding: {
                    top: '0px',
                    right: '0px',
                    bottom: '0px',
                    left: '50px',
                },
                titlePadding: {
                    top: '0px',
                    right: '10px',
                    bottom: '0px',
                    left: '10px',
                },
                imageHeight: '100px',
            },
            mobileAttributes: {
                imagePadding: {
                    top: '10px',
                    right: '10px',
                    bottom: '10px',
                    left: '10px',
                },
                imageHeight: 'auto'
            },
            data: {
                lock: true,
            }
        }

        return merge(payload, defaultData)
    },
    edit: props => <BlockPreview
        {...props}
        render={Edit}
    />,
    preview: props => <BlockRenderer
        {...props}
        render={Preview}
    />
})