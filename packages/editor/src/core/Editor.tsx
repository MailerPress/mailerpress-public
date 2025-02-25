import {createRoot} from "react-dom/client";
import {
    Popover,
    SlotFillProvider
} from "@wordpress/components";
import '../core/Blocks/index.ts'
import '../core/Patterns/index.ts'
import '../store/index.ts'
import React from "react";
import {ToastContextProvider} from "../context/Toast.tsx";
import {ThemeProvider} from "../context/Theme.tsx";
import MailerPressEmailBuilder from "./MailerPressEmailBuilder.tsx";
import {SelectionProvider} from "../context/SelectionProvider.tsx";

export const initializeEditor = (
    element: HTMLElement,
) => {

    import('../core/Templates/index.ts').then((mod) => {
        element.classList.add('mailerpress-root')

        if (!element) {
            return
        }

        const root = createRoot(
            element
        );

        root.render(
            <SlotFillProvider>
                <Popover.Slot/>
                <ToastContextProvider>
                    <SelectionProvider>
                        <ThemeProvider>
                            <div className="preview-block"/>
                            <MailerPressEmailBuilder/>
                        </ThemeProvider>
                    </SelectionProvider>
                </ToastContextProvider>
            </SlotFillProvider>
        )
    })

}