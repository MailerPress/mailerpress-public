import {registerBlockType} from "../../regisetBlockType.ts";
import {BlockRenderer} from "../../../components/BlockRenderer.tsx";
import {getAdapterAttributesString} from "../../../utils/getAdapterAttributesString.ts";
import {blockType, STORE_KEY} from "../../../constants.ts";
import _, {merge} from "lodash";
import {
    __experimentalText as Text,
    Dropdown,
    __experimentalItemGroup as ItemGroup,
    __experimentalItem as Item,
    __experimentalNavigatorScreen as NavigatorScreen,
    __experimentalNavigatorBackButton as BackButton,
    __experimentalNavigatorButton as NavigatorButton,
    __experimentalNavigatorProvider as NavigatorProvider,
    __experimentalVStack as VStack,
    __experimentalGrid as Grid,
    __experimentalHStack as HStack,
    __experimentalUseNavigator as useNavigator, Flex, Icon, Button, FlexBlock,
    __experimentalHeading as Heading,

} from "@wordpress/components";
import {__, sprintf, _n} from "@wordpress/i18n";
import {ColorControl, SelectControl} from "../../../UI/Settings/index.ts";
import {findColorInsideThemePalette} from "../../../utils/style.ts";
import {chevronLeft, chevronRight, typography, color, settings, textColor} from "@wordpress/icons";
import React, {useEffect, useMemo, useState} from "react";
import cx from "classnames/bind";
import BlockManager from "../../BlockManager.ts";
import {useDispatch, useSelect} from '@wordpress/data'
import FontManager from "../../../components/FontManager.tsx";
import {usePrevious} from "../../../hooks/usePrevious.ts";
import {updateAttributesByKey} from "../../../utils/block.ts";

$

export const renderHumanWeight = weight => {
    switch (weight) {
        case '100':
            return __('Thin', 'mailerpress');
        case '200':
            return __('Extra Light', 'mailerpress');
        case '300':
            return __('Light', 'mailerpress')
        case '400':
            return __('Regular', 'mailerpress')
        case '600':
            return __('Semi Bold', 'mailerpress')
        case '500':
            return __('Medium', 'mailerpress')
        case '800':
            return __('Bold', 'mailerpress')
        case '700':
            return __('Extra Bold ', 'mailerpress')
        case '900':
            return __('Black', 'mailerpress')
    }
}


const ElementFontSelector = ({element, config, fontsInstalled}) => {
    const {setFont, addBlock} = useDispatch(STORE_KEY)

    const [selectedFont, setSelectedFont] = useState(config.selectedFont)
    const [selectFontWeight, setSelectFontWeight] = useState(config.selectedVariant)
    const previousFont = usePrevious(selectedFont)
    const previousWeight = usePrevious(selectFontWeight)
    const {data} = useSelect(select => {
        return {
            data: select(STORE_KEY).getBlocks(),
        }
    }, [])
    const handleSelectFont = font => setSelectedFont(font)

    const handleSelectFontWeight = weight => setSelectFontWeight(weight)

    useEffect(() => {
        let fontWeight = selectFontWeight
        if (previousFont !== undefined && previousWeight !== undefined) {
            if (!{...fontsInstalled.core, ...fontsInstalled.installed}[selectedFont].includes(selectFontWeight)) {
                fontWeight = {...fontsInstalled.core, ...fontsInstalled.installed}[selectedFont][0]
            }

            setFont(
                element,
                selectedFont,
                fontWeight
            )

            addBlock(
                updateAttributesByKey(data, element, {
                    "font-family": selectedFont,
                    "font-weight": fontWeight,
                })
            )
        }
    }, [selectedFont, selectFontWeight]);

    return (
        <VStack spacing={1} style={{minWidth: 200}}>
            <SelectControl
                value={selectedFont}
                onChange={handleSelectFont}
                options={
                    Object.entries({...fontsInstalled.core, ...fontsInstalled.installed})
                        .map(([font, variants]) => ({
                            font,
                            variants
                        })) // Ensure correct destructuring
                        .reduce((acc, item) => {
                            // Your reduction logic here
                            acc.push({
                                label: item.font,
                                value: item.font,
                            },)
                            return acc;
                        }, [])
                }
                label={__('Typography', 'mailerpress')}
            />
            <SelectControl
                value={selectFontWeight}
                onChange={handleSelectFontWeight}
                options={{...fontsInstalled.core, ...fontsInstalled.installed}[selectedFont].reduce((acc, item) => {
                    acc.push({
                        label: renderHumanWeight(item),
                        value: item,
                    })
                    return acc
                }, [])}
                label={__('Appearance', 'mailerpress')}
            />
        </VStack>
    )
}

const preview = (attributes, previewMode, fonts, mappingFont) => {
    const {children, data} = attributes
    const fontTags = Object.entries({...fonts.core, ...fonts.installed}).map(([font, variants]) => {
        const variantString = variants ? `:wght@${variants.join(";")}` : "";
        if (font !== undefined) {
            return `<mj-font name="${font.replace(/ /g, "+")}" href="https://fonts.googleapis.com/css2?family=${font.replace(/ /g, "+")}${variantString}" />`;
        }
    });

    const buttonMarkup = `<mj-button 
      border-radius="${data.buttonRadius ?? '0px'}" 
      background-color="${data.button ?? '#000'}" 
      color="${data.buttonColor ?? '#fff'}" 
      font-weight="${mappingFont.button ? mappingFont.button.selectedVariant : ''}"
      font-family="${mappingFont.button ? mappingFont.button.selectedFont : ''}" />`;

    const textMarkup = `<mj-text 
        color="${data.color ?? '#000'}" 
        font-weight="${mappingFont.text ? mappingFont.text.selectedVariant : ''}"
        font-family="${mappingFont.text ? mappingFont.text.selectedFont : ''}"
      />`;

    const dividerMarkup = `<mj-divider border-color="${data.spacerBorderColor ? data.spacerBorderColor.hex : '#000'}" />`;

    return (
        <>
            {`
          <mjml>
          <mj-head>
              ${fontTags.join(' ')}
             <mj-attributes>
               ${buttonMarkup}
               ${textMarkup}
               ${dividerMarkup}
                </mj-attributes>
             <mj-style>
   
            </mj-style>
             <mj-style>
              :not(.node-type-group) > .mobile {
                   max-width: 100% !important;
                   width: 100% !important;
              }
                                    
              .mobile-preview .hide-mobile-block{max-height:0px;overflow:hidden;display:none!important}
              .mobile-preview .hide-desktop-block{display:block!important}
              .mobile-preview .hide-mobile-inline-block{max-height:0px;overflow:hidden;display:none!important}
              .mobile-preview .hide-desktop-inline-block{display:inline-block!important}
              .mobile-preview .mj-full-width-mobile{width: 100%!important}
                </mj-style>
                <mj-style inline="inline">
                  .mailerpress-button-link a, .node-type-text a {
                    color: ${data.link} !important; /* Couleur de lien par défaut */
                    text-decoration: underline; /* Ajouter un soulignement */
                  }
                </mj-style>
                <mj-style>.hidden {display: none !important;}</mj-style>
                <mj-style inline="inline">.hide-desktop-block,.hide-desktop-inline-block,.hide-block{display:none!important;mso-hide:all!important} </mj-style>
                <mj-style>.mjbody a{color:inherit}@media (max-width: 480px){.hide-mobile-block{max-height:0px;overflow:hidden;display:none!important}.hide-desktop-block{display:block!important}.hide-mobile-inline-block{max-height:0px;overflow:hidden;display:none!important}.hide-desktop-inline-block{display:inline-block!important}} </mj-style>
            
          </mj-head>
          <mj-body ${getAdapterAttributesString(attributes)}>
        `}
            {children.map((child, index) => (
                <BlockRenderer
                    key={index}
                    data={child}
                    previewMode={previewMode}
                />
            ))}

            {`
          </mj-body>
          </mjml>
        `}
        </>
    )
}

const edit = (props) => {
    const {setAttributes, setData, theme, onEditTheme} = props

    const getTheme = useMemo(() => {
        return window.jsVars.themeStyles[theme]
    }, [theme]);

    const themeStyles = window.jsVars.themeStyles || {};
    const coreTheme = themeStyles['Core'];
    const otherThemes = Object.entries(themeStyles).filter(([key]) => key !== 'Core');

    const BlockGlobalManager = ({props}) => {
        const {params} = useNavigator();
        const fontsInstalled = useSelect((select) => select(STORE_KEY).getInstalledFont(), []);
        const fontsMapping = useSelect((select) => select(STORE_KEY).getFonts(), []);
        const view = useMemo(() => {

            const {
                setModal,
            } = useDispatch(STORE_KEY)

            const selectFont = () => {
                setModal({
                    className: "mailerpress-font-modal",
                    title: __('Fonts', 'mailerpress'),
                    component: <FontManager
                        fontsApplied={fontsInstalled}
                    />,
                    size: 'large',
                })
            }

            switch (params.params) {
                case "colors":
                    return (
                        <VStack spacing={4}>
                            <Text>
                                {__('Palette colors and the application of those colors on email elements.', 'mailerpress')}
                            </Text>
                            <ColorControl
                                {...props}
                                attrs={['color', 'background-color', 'button', 'link', 'buttonColor']}
                                onChange={(val, attr) => {
                                    if ('background-color' === attr) {
                                        setAttributes({[attr]: val})
                                    } else {
                                        setData({[attr]: val})
                                    }
                                }}
                            />
                        </VStack>
                    )
                case "typography":
                    return (
                        <>
                            <VStack spacing={4}>
                                <Text>
                                    {__('Available fonts, typographic styles, and the application of those styles.', 'mailerpress')}
                                </Text>
                                <HStack>
                                    <Text uppercase>{__('Fonts', 'mailerpress')}</Text>
                                    <Button
                                        tooltipPosition={"top"}
                                        label={__('Open fonts manager', 'mailerpress')}
                                        onClick={selectFont}
                                        icon={settings}
                                    />
                                </HStack>
                            </VStack>
                            <ItemGroup isBordered isSeparated>
                                {
                                    Object.entries({...fontsInstalled.core, ...fontsInstalled.installed}).map(([font, variants]) => {
                                        return ( // Add return here
                                            <Item key={font}>
                                                <HStack>
                                                    <Button variant="link">{font}</Button>
                                                    <Text variant="muted">
                                                        {
                                                            sprintf(
                                                                _n('%d variant', '%d variants', variants.length, 'mailerpress'),
                                                                variants.length
                                                            )
                                                        }
                                                    </Text>
                                                </HStack>
                                            </Item>
                                        );
                                    })
                                }
                            </ItemGroup>
                            <VStack style={{marginTop: 16}}>
                                <Text>
                                    {__('Elements', 'mailerpress')}
                                </Text>
                                <div className="mailerpress-typo-elements">
                                    {
                                        Object.entries(fontsMapping).map(([element, config]) => {
                                            return (
                                                <Dropdown
                                                    key={element}
                                                    popoverProps={{placement: 'left-start'}}
                                                    renderToggle={({isOpen, onToggle}) => (
                                                        <div
                                                            style={{padding: 8}}
                                                            onClick={onToggle}
                                                            aria-expanded={isOpen}
                                                        >
                                                            <Flex justify={"space-between"} align={"center"}>
                                                                <FlexBlock style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center'
                                                                }}>
                                                                    <Icon icon={textColor}/>
                                                                    <Heading level={5} weight={"medium"}>
                                                                        {element}
                                                                    </Heading>
                                                                </FlexBlock>
                                                                <Text
                                                                    variant={"muted"}>
                                                                    {config.selectedFont} {config.selectedVariant}
                                                                </Text>

                                                            </Flex>
                                                        </div>
                                                    )}
                                                    renderContent={() => <ElementFontSelector
                                                        element={element}
                                                        config={config}
                                                        fontsInstalled={fontsInstalled}
                                                    />}
                                                />
                                            )
                                        })
                                    }

                                </div>
                            </VStack>
                        </>
                    )
            }
        }, [params, fontsInstalled, fontsMapping]);

        return (
            <div style={{padding: 16}}>
                <VStack spacing={2}>
                    <BackButton variant="tertiary" icon={chevronLeft}>
                        {__('Go back', 'mailerpress')}
                    </BackButton>
                    <div style={{padding: '0px 8px'}}>
                        {view}
                    </div>
                </VStack>
            </div>
        )
    }

    return (
        <>
            <NavigatorProvider initialPath="/">
                <NavigatorScreen path="/">
                    <VStack>
                        <div style={{padding: 8}}>
                            <VStack>
                                <div style={{
                                    width: '100%',
                                    height: 150,
                                    borderRadius: 4,
                                    background: findColorInsideThemePalette(getTheme, 'styles > color > background'),
                                    border: '1px solid rgb(224 224 224)',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}>
                                    <Text color={findColorInsideThemePalette(
                                        getTheme,
                                        'styles > color > text'
                                    )} weight="bold" size={20}>{getTheme.title}</Text>
                                </div>

                                <NavigatorButton
                                    variant={"tertiary"}
                                    style={{display: 'flex', justifyContent: 'space-between', alignItems: "center"}}
                                    path="/all-styles"
                                    icon={chevronRight} iconPosition="right"
                                >
                                    {__('Browse styles', 'mailerpress')}
                                </NavigatorButton>

                                <ItemGroup
                                >
                                    <NavigatorButton
                                        style={{width: '100%'}}
                                        path="/styles/typography"
                                        icon={typography}
                                    >
                                        {__('Typography', 'mailerpress')}
                                    </NavigatorButton>

                                    <NavigatorButton
                                        style={{width: '100%'}}
                                        path="/styles/colors"
                                        icon={color}
                                    >
                                        {__('Colors', 'mailerpress')}
                                    </NavigatorButton>

                                </ItemGroup>
                            </VStack>
                            {/*<GoogleFontPicker onFontSelect={(font, variant) => {*/}
                            {/*    setSelectedFont(font);*/}
                            {/*    setSelectedVariant(variant);*/}
                            {/*}}/>*/}
                        </div>
                    </VStack>
                </NavigatorScreen>
                <NavigatorScreen path="/all-styles">
                    <div style={{padding: 16}}>
                        <VStack spacing={4}>
                            <BackButton variant="tertiary" icon={chevronLeft}>
                                {__('Go back', 'mailerpress')}
                            </BackButton>
                            <Text>
                                {__('Choose a variation to change the look of your email.', 'mailerpress')}
                            </Text>
                            {window.jsVars.themeStyles &&
                                <Grid className="mailerpress-theme-grid" columns={2}>
                                    {coreTheme && (
                                        <div
                                            className={cx({
                                                active: coreTheme.title === getTheme.title
                                            })}
                                            onClick={() => onEditTheme(coreTheme.title)}
                                            style={{
                                                cursor: 'pointer',
                                                width: '100%',
                                                height: 70,
                                                borderRadius: 4,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: findColorInsideThemePalette(
                                                    coreTheme,
                                                    'styles > color > background'
                                                ),
                                                border: '1px solid rgb(224 224 224)'
                                            }}
                                        >
                <span
                    style={{
                        pointerEvents: "none",
                        color: findColorInsideThemePalette(
                            coreTheme,
                            'styles > color > text'
                        )
                    }}
                >
                    {coreTheme.title}
                </span>
                                        </div>
                                    )}

                                    {/* Render Other Themes */}
                                    {otherThemes.map(([key, style]) => (
                                        <div
                                            className={cx({
                                                active: style.title === getTheme.title
                                            })}
                                            key={key}
                                            onClick={() => onEditTheme && onEditTheme(style.title)}
                                            style={{
                                                cursor: 'pointer',
                                                width: '100%',
                                                height: 70,
                                                borderRadius: 4,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: findColorInsideThemePalette(
                                                    _.merge(_.cloneDeep(coreTheme), style),
                                                    'styles > color > background'
                                                ),
                                                border: '1px solid rgb(224 224 224)'
                                            }}
                                        >
                <span
                    style={{
                        pointerEvents: "none",
                        color: findColorInsideThemePalette(
                            _.merge(_.cloneDeep(coreTheme), style),
                            'styles > color > text'
                        )
                    }}
                >
                    {style.title}
                </span>
                                        </div>
                                    ))}
                                </Grid>
                            }
                        </VStack>
                    </div>
                </NavigatorScreen>
                <NavigatorScreen path="/block-styles">
                    <div style={{padding: 8}}>
                        <VStack spacing={4}>
                            <ItemGroup
                                isBordered
                                isSeparated
                            >
                                {
                                    BlockManager.getBlocks().filter(b => b.type !== 'page').map(b =>
                                        <HStack>
                                            <NavigatorButton variant={"tertiary"} path={`/block-styles/${b.type}`}
                                                             style={{width: '100%'}}>
                                                <HStack>
                                                    <Flex align={"center"} justify={'flex-start'}>
                                                        <span dangerouslySetInnerHTML={{__html: b.icon}}/>
                                                        <Text>{b.name}</Text>
                                                    </Flex>
                                                    <Icon icon={chevronRight}/>
                                                </HStack>
                                            </NavigatorButton>
                                        </HStack>
                                    )
                                }
                            </ItemGroup>
                        </VStack>
                    </div>
                </NavigatorScreen>
                <NavigatorScreen path="/styles/:params">
                    <BlockGlobalManager props={props}/>
                </NavigatorScreen>
            </NavigatorProvider>
        </>
    )

}

registerBlockType({
    type: blockType.PAGE,
    icon:
        '',
    disabledBlockType:
        [],
    edit,
    preview,
    name:
        "Page",
    internal:
        true,
    init:
        (payload) => {
            const defaultData = {
                'type': blockType.PAGE,
                attributes: {
                    'width': '600px'
                },
                children: [],
                data: {lock: true}
            }
            return merge(defaultData, payload)
        }
})