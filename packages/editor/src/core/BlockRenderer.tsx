const BlockRenderer = props => {

    return props.mobileAttributes !== undefined
        ?
        <>
            <props.render block={{
                ...props,
                attributes: {
                    ...props.attributes,
                    'css-class': 'hide-mobile-block',
                }
            }
            }
            />

            <props.render
                block={
                    {
                        ...props,
                        attributes:
                            {
                                ...props.attributes,
                                ...props.mobileAttributes,
                                'css-class':
                                    'hide-desktop-block',
                            }
                    }
                }
            />
        </>
        :
        <props.render block={
            {
                ...props
            }
        }
        />;
}
export default BlockRenderer