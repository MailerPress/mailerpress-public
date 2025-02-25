import BlockManager from "../core/BlockManager.ts";
import {renderToString} from "react-dom/server";
import decode from "unescape"
import {html} from 'js-beautify';
import {useTheme} from "../context/Theme.tsx";
import {convertToValidHex, findColorInsideThemePalette, findValueInsideTheme} from "./style.ts";

export function JsonToMjml(options, previewMode = 'live', fonts = {}, mappingFont = {}, theme = 'Core'): string {
    const {data} = options;
    const block = BlockManager.getBlockByType('page');
    if (!block) {
        throw new Error(`Block ${data.type} not found`);
    }
    const style = window.jsVars.themeStyles[theme]

    const mjmlString = decode(
        wp.element.renderToString(
            block.preview(
                block.init({
                    ...options,
                    data: {
                        fonts: {...mappingFont},
                        color: (data && data.color) || findColorInsideThemePalette(style, 'styles > color > text'),
                        button: (data && data.button) || findColorInsideThemePalette(style, 'styles > elements > button > color > background'),
                        buttonColor: (data && data.buttonColor) || findColorInsideThemePalette(style, 'styles > elements > button > color > text'),
                        link: (data && data.link) || findColorInsideThemePalette(style, 'styles > elements > link > color > text'),
                        buttonRadius: (data && data.buttonRadius) || findValueInsideTheme(style, 'styles > elements > button > border > radius'),
                        spacerBorderColor: (data && data.spacerBorderColor) || convertToValidHex(findColorInsideThemePalette(style, 'styles > blocks > core/separator > color > text'))

                    },
                }),
                previewMode,
                fonts,
                mappingFont
            )
        ),
    );

    return html(mjmlString, {indent_size: 2})
}
