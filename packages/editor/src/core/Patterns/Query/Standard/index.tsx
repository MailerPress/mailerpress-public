import {merge} from "lodash";
import {registerQueryPattern} from "../../../regisetBlockType.ts";
import {Section, Text, Column, Image, Button} from "../../../components/index.ts";
import {getPreviewClassName} from "../../../../utils/getAdapterAttributesString.ts";
import React from "react";
import {__} from "@wordpress/i18n";
import BlockPreview from "../../../BlockPreview.tsx";
import BlockRenderer from "../../../BlockRenderer.tsx";
import classNames from "classnames";

const Edit = (props) => {
    return <>
    </>
}

const Preview = ({block}) => {
    let {attributes, data} = block

    const rows = [];
    for (let i = 0; i < data.posts.length; i += data.columnSize) {
        rows.push(data.posts.slice(i, i + data.columnSize));
    }

    return (
        <>
            {
                data.posts && data.posts.length === 0 &&
                <Section css-class={
                    classNames(
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
                    <Section css-class={
                        classNames(
                            getPreviewClassName(block.clientId ?? ''),
                            attributes['css-class']
                        )} padding={"0px 0px 0px 0px"} full-width={"full-width"}>
                        <Column vertical-align={"top"}>
                            <Image
                                height={"300px"}

                                href={p.link}
                                align={"left"}
                                fluid-on-mobile={"true"}
                                src={p.images && p.images.medium ? p.images.medium : "https://placehold.co/1280x800/png"}
                            />

                            <Text padding-left={"0px"} padding-right={"16px"} padding-bottom={"0px"}
                                  font-size={'23px'} font-weight={'bold'} color={"#000000"}
                                  line-height={'30px'}>
                                {p.title.rendered}
                            </Text>

                            {p.excerpt.rendered &&
                                <Text padding-left={"0px"} padding-right={"16px"} padding-bottom={"0px"}
                                      font-size={'14px'} font-weight={'normal'}
                                      color={"#6B6B6B"} line-height={'16px'}>
                                    {p.excerpt.rendered.innerHTML}
                                </Text>
                            }
                            <Button href={p.link} padding-bottom="20px" padding-top="20px">
                                Read more
                            </Button>
                        </Column>
                    </Section>
                )

            }

            {
                data.posts && data.posts.length > 0 && data.displayMode === 'grid' &&
                rows.map((row, rowIndex) => (
                    <Section css-class={
                        classNames(
                            getPreviewClassName(block.clientId ?? ''),
                            attributes['css-class']
                        )} full-width={"full-width"}>
                        {row.map((post, colIndex) => (
                            <Column key={colIndex} vertical-align={"top"} padding-left={"8px"}
                                    padding-right={"8px"}>
                                <Image
                                    height={"200px"}
                                    href={post.link}
                                    padding="0px 0px 0px 0px"
                                    align={"left"}
                                    fluid-on-mobile={"true"}
                                    src={post.image && post.images.medium ? post.images.medium : "https://placehold.co/1280x800/png"}
                                />

                                <Text align={"center"} font-size={'23px'} font-weight={'bold'}
                                      color={"#000000"} padding-bottom="0px" padding-left={"0px"}
                                      padding-right={"0px"} line-height={'30px'}>
                                    {post.title.rendered}
                                </Text>
                                {post.excerpt.rendered &&
                                    <Text align={"center"} padding-bottom="0px" font-size={'14px'}
                                          font-weight={'normal'}
                                          color={"#6B6B6B"} line-height={'16px'} padding-left={"0px"}
                                          padding-right={"0px"}>
                                        {post.excerpt.rendered.innerHTML}
                                    </Text>
                                }
                                <Button href={post.link} align={"center"} padding-bottom="30px"
                                        padding-top="20px"
                                        padding-left="0px"
                                        padding-right="0px">
                                    Read more
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
    id: "standard",
    name: __('Standard one column', 'mailerpress'),
    description: 'default desc',
    attributes: {},
    init: (payload) => {
        const defaultData = {
            attributes: {},
            mobileAttributes: {},
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
    preview: props => <BlockRenderer render={Preview} {...props} />,
})