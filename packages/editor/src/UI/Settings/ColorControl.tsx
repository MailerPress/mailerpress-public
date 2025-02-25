import React, {useMemo} from "react"
import SettingRow from "../SettingRow.tsx";
import {
    ColorPalette,
    __experimentalText as Text,
    Button,
    Dropdown, ColorIndicator
} from "@wordpress/components";
import {t} from "../../utils/function.ts";
import {__} from "@wordpress/i18n";
import {useSelect} from "@wordpress/data";
import {STORE_KEY} from "../../constants.ts";
import {useTheme} from "../../context/Theme.tsx";

export const ColorControl = (props) => {
    const {block, setAttributes, attrs, onChange} = props
    const attributes = attrs === undefined ? [
        'color',
        'background-color'
    ] : attrs

    const {theme} = useTheme()

    const getTheme = useMemo(() => {
        return window.jsVars.themeStyles[theme]
    }, [theme]);


    const formatName = attr => {
        switch (attr) {
            case 'color':
                return __('Color', 'mailerpress')
            case 'background-color':
                return __('Background color', 'mailerpress')
            case 'container-background-color':
                return __('Container background color', 'mailerpress')
            case 'border-color':
                return __('Border color', 'mailerpress')
            case 'button':
                return __('Button background', 'mailerpress')
            case 'buttonColor':
                return __('Button color', 'mailerpress')
            case 'link':
                return __('Link', 'mailerpress')
            default:
                return ''
        }
    }

    return (
        <SettingRow>
            <div className={"mailerpress-field__color"}>
                {attributes.map(attr => <Dropdown
                    className="mp-color-field"
                    popoverProps={{placement: 'left-start'}}
                    renderToggle={({isOpen, onToggle}) => (
                        <Button
                            onClick={onToggle}
                            aria-expanded={isOpen}
                        >
                            <>
                                <ColorIndicator
                                    colorValue={block.attributes[attr] || block.data[attr]}
                                />
                                <Text weight={"medium"}>{t(formatName(attr))}</Text>
                            </>
                        </Button>
                    )}
                    renderContent={() => <ColorPalette
                        colors={
                            getTheme ? getTheme.settings.color.palette.filter(c => (c.color.startsWith('#') || c.color.startsWith('rgb') || c.color.startsWith('rgba'))) : []
                        }
                        __experimentalIsRenderedInSidebar={true}
                        value={block.attributes[attr] || block.data[attr]}
                        onChange={(color) => onChange !== undefined ? onChange(color, attr) : props.setAttributes({[attr]: color})}
                    />}
                />)}
            </div>
        </SettingRow>
    )
}