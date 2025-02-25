import {registerPattern, registerTemplate} from "./src/core/regisetBlockType.ts"
import {Column, Section, Text, Wrapper, Divider, Spacer, Button} from "./src/core/components/index.ts";
import {getPreviewClassName} from "./src/utils/getAdapterAttributesString.ts";
import {
    Panel,
    AlignControl,
    HeightControl,
    ColorControl,
    InputControl,
    PaddingControl,
    FontSize,
    InnerPadding,
    BorderBox,
    BorderRadius,
    WidthHeight,
    MediaUpload
} from './src/UI/Settings/index.ts'
import React from "react";
import {getEditorRoot} from "./src/utils/editorRoot.ts";
import HeaderNavigator from "../Admin/Components/Menu/HeaderNavigator.tsx";
import ComponentWrapper from "../Admin/Components/ComponentWrapper.tsx";
import useDataRecords from "../hooks/useDataRecords.ts";
import DataView from "../components/DataView/index.tsx";
import * as icons from '@wordpress/icons';
import {t} from "./src/utils/function.ts";
import {useURL} from "../Admin/context/UrlContext.tsx";
import EditorSkeleton from "./src/UI/Interfaces/EditorSkeleton.tsx";

window.mailerpress = {
    blockEditor: {
        react: React,
        registerPattern,
        registerTemplate,
        patternCategories: jsVars.patternCategories,
        templatesCategories: jsVars.templatesCategories,
        functions: {
            getPreviewClassName,
            getEditorRoot,
            i18n: t
        },
        components: {
            Section,
            Column,
            Text,
            Wrapper,
            Divider,
            Spacer,
            Button
        },
        settings: {
            Panel,
            AlignControl,
            HeightControl,
            ColorControl,
            InputControl,
            PaddingControl,
            FontSize,
            InnerPadding,
            BorderBox,
            BorderRadius,
            WidthHeight,
            MediaUpload
        },
        interfaces: {
            EditorSkeleton
        }
    },
    admin: {
        HeaderNavigator,
        ComponentWrapper,
        DataView,
        useDataRecords,
        icons,
        useURL
    }
}

