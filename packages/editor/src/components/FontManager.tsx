import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
    TabPanel,
    __experimentalHStack as HStack,
    __experimentalVStack as VStack,
    __experimentalText as Text,
    CheckboxControl,
    SearchControl,
    SelectControl,
    Button,
    __experimentalNavigatorScreen as NavigatorScreen,
    __experimentalNavigatorBackButton as BackButton,
    __experimentalNavigatorButton as NavigatorButton,
    Notice,
    __experimentalNavigatorProvider as NavigatorProvider,
    __experimentalItemGroup as ItemGroup,
    __experimentalHeading as Heading,
    __experimentalUseNavigator as useNavigator,
} from '@wordpress/components'
import {__, sprintf, _n} from "@wordpress/i18n";
import {useDispatch, useSelect} from "@wordpress/data";
import {chevronLeft, chevronRight, color, Icon, trash, typography} from "@wordpress/icons";
import {STORE_KEY} from "../constants.ts";
import {t} from "../utils/function.ts";
import {ApiService} from "../core/apiService.ts";
import {useToasts} from "../hooks/useToasts.ts";

const FontItem = ({font}) => {

    const navigator = useNavigator();
    const [isFontLoaded, setIsFontLoaded] = useState(false);

    useEffect(() => {
        loadFont(font).then((font) => {
            setIsFontLoaded(font);  // Mark the font as loaded
        });
    }, [font]);

    async function loadFont(font) {
        const variantString = font.variants.length > 0 ? `:wght@${font.variants.join(";")}` : "";
        const fontCssUrl = `https://fonts.googleapis.com/css2?family=${font.family.replace(/ /g, "+")}${variantString}`;
        const response = await fetch(fontCssUrl);
        const cssText = await response.text();
        const fontUrlMatch = cssText.match(/url\((.*?)\)/);

        if (fontUrlMatch) {
            const fontUrl = fontUrlMatch[1].replace(/['"]/g, "");
            const fontFace = new FontFace(font.family, `url(${fontUrl})`);
            await fontFace.load();
            document.fonts.add(fontFace);
            return font;
        }
    }

    return (
        <div style={{cursor: 'pointer', borderBottom: '1px solid #e5e5e5'}}
             onClick={() => navigator.goTo(`/font-details/${font.family}`)}>
            <HStack style={{padding: 16}} justify={"space-between"}>
                <Heading
                    style={{
                        fontFamily: isFontLoaded ? `${font.family}, sans-serif` : 'initial',
                        fontWeight: isFontLoaded ? parseInt(font.variants[0]) : 400,
                        fontStyle: 'normal',
                        fontStretch: 'normal',
                        fontOpticalSizing: 'auto'

                    }}  // Apply font once loaded
                    level={3}
                >
                    {font.family}
                </Heading>
                <HStack expanded={false}>
                    <Text variant={"muted"}>
                        {
                            sprintf(
                                _n('%d variant', '%d variants', font.variants.length, 'mailerpress'), font.variants.length
                            )
                        }
                    </Text>
                    <Icon icon={chevronRight}/>
                </HStack>
            </HStack>
        </div>
    );
};
const FontVariant = ({font, variant, selection, onToggle, isDeletable, onDelete}) => {
    const [isFontLoaded, setIsFontLoaded] = useState(false);

    useEffect(() => {
        loadFont(font).then((font) => {
            setIsFontLoaded(font);  // Mark the font as loaded
        });
    }, [font]);

    async function loadFont(font) {
        const fontCssUrl = `https://fonts.googleapis.com/css2?family=${font.family.replace(/ /g, "+")}:wght@${variant}`;
        const response = await fetch(fontCssUrl);
        const cssText = await response.text();
        const fontUrlMatch = cssText.match(/url\((.*?)\)/);

        if (fontUrlMatch) {
            const fontUrl = fontUrlMatch[1].replace(/['"]/g, "");
            const fontFace = new FontFace(font.family, `url(${fontUrl})`);
            await fontFace.load();
            document.fonts.add(fontFace);
            return font;
        }
    }

    return (
        <div style={{width: '100%'}} onClick={() => onToggle(variant)}>
            {false !== isFontLoaded &&
                <HStack justify="space-between">
                    {selection !== undefined &&
                        <CheckboxControl
                            __nextHasNoMarginBottom
                            checked={selection.includes(variant)}
                            onChange={() => onToggle(variant)}
                        />
                    }
                    <Heading
                        style={{
                            fontFamily: `${font.family}, sans-serif`,
                            fontWeight: parseInt(variant),
                            fontStyle: 'normal',
                            fontStretch: 'normal',
                            fontOpticalSizing: 'auto'

                        }}  // Apply font once loaded
                        level={3}
                    >
                        {
                            selection !== undefined ?
                                sprintf('%s %s', font.family, variant) :
                                font.family
                        }

                    </Heading>
                    {isDeletable &&
                        <Button isDestructive icon={trash} onClick={onDelete}>
                            {__('Delete', 'mailerpress')}
                        </Button>
                    }
                </HStack>
            }
        </div>
    );
};
const ListingAvailableFonts = ({data, onLoad, filters, handleChangeCategory, handleSearchChange, count}) => {
    const googleFonts = window.jsVars.googleFonts

    useEffect(() => {
        onLoad('listing')
    }, []);
    return (
        <VStack>
            <HStack alignment={"top"} justify={"space-between"}>
                <VStack>
                    <Text size={"11px"} weight={"medium"} upperCase={true}>{__('Search', 'mailerpress')}</Text>
                    <SearchControl
                        value={filters.search ?? ''}
                        __nextHasNoMarginBottom
                        onChange={handleSearchChange}
                    />
                </VStack>

                <SelectControl
                    selected={filters.category}
                    __nextHasNoMarginBottom
                    label={__('Category', 'mailerpress')}
                    onChange={handleChangeCategory}
                    options={
                        Object.keys(googleFonts).reduce((acc, item) => {
                            acc.push({
                                label: item,
                                value: item
                            })
                            return acc
                        }, [{label: 'All', value: null}])
                    }
                />
            </HStack>
            <Text align={"right"} variant={"muted"}>
                {
                    sprintf(
                        _n('%d font available', '%d fonts available', count, 'mailerpress'), count
                    )
                }
            </Text>
            <ItemGroup
                isBordered
            >
                {
                    data.map((item, index) => <FontItem key={item.menu
                    } font={item}/>)
                }
            </ItemGroup>
        </VStack>
    )
}
const FontDetail = ({onLoad, onSelectVariation, isInstalled}) => {
    const {params, goBack} = useNavigator();
    const [selection, setSelection] = useState([])

    useEffect(() => {
        onLoad('detail')
    }, []);

    const font = useMemo(() => {
        const allFonts = Object.values(window.jsVars.googleFonts).flat()
        const find = allFonts.find(f => f.family === params.family)
        if (find) {
            return {
                ...find,
                variants: find.variants.filter(variant => /^[0-9]+$/.test(variant))
            }
        }
    }, [params]);
    const handleToggle = (variant) => {
        if (selection.includes(variant)) {
            setSelection(selection.filter(v => v !== variant))
        } else {
            setSelection([...selection, variant])
        }
    }

    useEffect(() => {
        if (selection.length > 0) {
            onSelectVariation({
                [font.family]: selection
            })
        } else {
            onSelectVariation(null)
        }
    }, [selection]);

    return (
        <VStack>
            {
                font &&
                <VStack style={{padding: 8}}>
                    <HStack alignment="left">
                        <Button size={"compact"} icon={chevronLeft} onClick={goBack}/>
                        <Text>{font.family}</Text>
                    </HStack>
                    <Text>
                        {__('Select font variants to install.', 'mailerpress')}
                    </Text>
                    {isInstalled && <Notice
                        className="mailerpress-notice-actions"
                        status={"success"}
                        isDismissible
                    >
                        {
                            __('Fonts were installed successfully.', 'mailerpress')
                        }
                    </Notice>}
                    <ItemGroup
                        isBordered
                    >
                        {
                            font.variants.map((item, index) =>
                                <HStack
                                    style={{padding: 16, borderBottom: '1px solid #e5e5e5'}}
                                    justify={"space-between"}>
                                    <FontVariant
                                        selection={selection}
                                        onToggle={handleToggle}
                                        font={font}
                                        variant={item}
                                    />
                                </HStack>
                            )
                        }
                    </ItemGroup>
                </VStack>
            }
        </VStack>
    )
}


const FontLib = ({fontsApplied}) => {
    const allFonts = Object.values(window.jsVars.googleFonts).flat()
    const {pushToast} = useToasts();
    const {removeFont} = useDispatch(STORE_KEY)

    const onDeleteFont = font => {
        ApiService.deleteFont(font).then(() => {
            removeFont(font)
            pushToast({
                title: __('Font deleted successfully', 'mailerpress'),
                status: 'success',
                duration: 5
            })
        })
    }


    return (
        <VStack style={{paddingBottom: 16}}>
            <Heading>{__('Core fonts', 'mailerpress')}</Heading>
            <ItemGroup
                isBordered
            >
                {
                    Object.entries(fontsApplied.core).map(([font, variant]) =>
                        <HStack style={{padding: 16, borderBottom: '1px solid #e5e5e5'}} justify={"space-between"}>
                            <FontVariant
                                font={allFonts.find(f => f.family === font)}
                                variant={variant[0]}
                            />
                        </HStack>
                    )
                }
            </ItemGroup>
            <Heading>{__('Your fonts', 'mailerpress')}</Heading>
            <ItemGroup
                isBordered
            >
                {
                    Object.values(fontsApplied.installed).length === 0 &&
                    <Notice isDismissible={false} status={"warning"}>
                        {__('You have not installed any fonts yet.', 'mailerpress')}
                    </Notice>
                }
                {
                    Object.values(fontsApplied.installed).length > 0 && Object.entries(fontsApplied.installed).map(([font, variant]) =>
                        <HStack style={{padding: 16, borderBottom: '1px solid #e5e5e5'}} justify={"space-between"}>
                            <FontVariant
                                font={allFonts.find(f => f.family === font)}
                                variant={variant[0]}
                                isDeletable
                                onDelete={() => onDeleteFont(font)}
                            />
                        </HStack>
                    )
                }
            </ItemGroup>
        </VStack>
    )
}
const LibManager = ({fontsApplied}) => {

    return (
        <VStack>
            <FontLib fontsApplied={fontsApplied}/>
        </VStack>
    )
}
const InstallManager = () => {
    const itemsPerPage = 5;
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState({
        search: '',
        category: null
    })
    const [route, setRoute] = useState('listing')
    const [font, setFont] = useState(null)
    const {installFont} = useDispatch(STORE_KEY);
    const [isInstalled, setIsInstalled] = useState(false)
    const fontsInstalled = useSelect((select) => select(STORE_KEY).getInstalledFont(), []);
    const handleChangeCategory = category => {
        setCurrentPage(1)
        setFilters(prevState => {
            return {...prevState, category}
        })
    }
    const handleSearchChange = search => {
        setCurrentPage(1)

        setFilters(prevState => {
            return {...prevState, search}
        })
    }

    const data = useMemo(() => {
            let result = [];
            const excludeFamilies = Object.keys({...fontsInstalled.core, ...fontsInstalled.installed});

            if (filters.category === null && filters.search === '') {
                result = Object.values(window.jsVars.googleFonts).flat()
                console.log('result', result, {...fontsInstalled.core, ...fontsInstalled.installed})
            } else if (filters.category !== null && filters.search === '') {
                result = window.jsVars.googleFonts[filters.category]
            } else if (filters.category === null && filters.search !== '') {
                result = Object.values(window.jsVars.googleFonts).flat().filter(f => f.family.toLocaleLowerCase().startsWith(filters.search.toLocaleLowerCase()))
            } else {
                result = window.jsVars.googleFonts[filters.category].filter(f => f.family.toLocaleLowerCase().startsWith(filters.search.toLocaleLowerCase()))
            }

            const filteredFontsList = result.filter(font => !excludeFamilies.includes(font.family));

            return filteredFontsList.reduce((acc, font) => {
                const filtered = font.variants.filter(variant => /^[0-9]+$/.test(variant))
                if (filtered.length > 0) {
                    acc.push({
                        ...font,
                        variants: font.variants.filter(variant => /^[0-9]+$/.test(variant))
                    })
                }
                return acc
            }, [])
        }, [filters, fontsInstalled]
    )

    // Calculate the total number of pages
    const totalPages = Math.ceil(data.length / itemsPerPage);

    // Get data for the current page
    const currentData = data.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const onLoad = (route) => {
        setRoute(route)
    }

    const addFontToLibrary = () => {
        if (font) {
            ApiService.installFont(font).then(() => {
                installFont(font)
                setIsInstalled(true)
            })

        }
    }

    const onSelectVariation = variations => {
        if (variations) {
            setFont(variations)
        } else {
            setFont(null)
        }
    }

    return (
        <VStack>
            <NavigatorProvider initialPath="/">
                <NavigatorScreen path="/">
                    <ListingAvailableFonts
                        count={data.length}
                        data={currentData}
                        onLoad={onLoad}
                        filters={filters}
                        handleSearchChange={handleSearchChange}
                        handleChangeCategory={handleChangeCategory}
                    />
                </NavigatorScreen>
                <NavigatorScreen path="/font-details/:family">
                    <FontDetail
                        onLoad={onLoad}
                        onSelectVariation={onSelectVariation}
                        isInstalled={isInstalled}
                    />
                </NavigatorScreen>
            </NavigatorProvider>
            <div className="footer-sticky-fonts-lib">
                {route === 'listing' && <HStack expanded={false} justify={"center"}>
                    <Button
                        disabled={currentPage === 1}
                        icon={chevronLeft}
                        onClick={() => setCurrentPage(prevState => prevState - 1)}
                    />
                    <Text>{__('Page', 'mailerpress')}</Text>
                    <SelectControl
                        __nextHasNoMarginBottom
                        value={currentPage}
                        onChange={val => setCurrentPage(parseInt(val))}
                        options={
                            Array.from({length: totalPages}, (_, index) => index + 1).reduce((acc, item) => {
                                acc.push({
                                    label: item,
                                    value: item
                                })
                                return acc
                            }, [])
                        }
                    />
                    <Text>{sprintf(__('of %s', 'mailerpress'), totalPages)}</Text>
                    <Button
                        disabled={currentPage === totalPages}
                        icon={chevronRight}
                        onClick={() => setCurrentPage(prevState => prevState + 1)}
                    />
                </HStack>}
                {route === 'detail' && <Button onClick={addFontToLibrary} variant={"primary"}>
                    {__('Save', 'mailerpress')}
                </Button>}
            </div>
        </VStack>
    )
}
export const FontManager = () => {
    const fontsInstalled = useSelect((select) => select(STORE_KEY).getInstalledFont(), []);
    return (
        <div>
            <TabPanel
                className="my-tab-panel"
                activeClass="active-tab"
                tabs={[
                    {
                        name: 'tab1',
                        title: __('Library', 'mailerpress')
                    },
                    {
                        name: 'tab2',
                        title: __('Install fonts', 'mailerpress')
                    }
                ]}
            >
                {(tab) => {
                    return (
                        <div style={{marginTop: 16}}>
                            {tab.name === 'tab1' && <LibManager fontsApplied={fontsInstalled}/>}
                            {tab.name === 'tab2' && <InstallManager/>}
                        </div>
                    )
                }}
            </TabPanel>
        </div>
    )
        ;
};

export default FontManager;
