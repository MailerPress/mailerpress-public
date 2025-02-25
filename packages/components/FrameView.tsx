import React, {useEffect, useRef, useState, useMemo} from 'react';
import mjml2html from "mjml-browser";
import {JsonToMjml} from "../editor/src/utils/JsonToMjml.ts";
import {maybeRegenerateQuery} from "../editor/src/components/ReviewAndSend.tsx";
import {Spinner} from "@wordpress/components";
import {useSelect} from "@wordpress/data";
import {STORE_KEY} from "../editor/src/constants.ts";

export default function FrameView({data, onClick}) {
    const iframe = useRef();
    const [ratio, setRatio] = useState('16:9'); // Default ratio
    const [isLoading, setIsLoading] = useState(true);
    const fonts = useSelect((select) => select(STORE_KEY).getInstalledFont(), []);
    const mappingFont = useSelect((select) => select(STORE_KEY).getFonts(), []);

    // Memoize the MJML to HTML conversion
    const mjmlHtml = useMemo(() => {
        return maybeRegenerateQuery(data).then(updatedData => {
            const result = mjml2html(JsonToMjml(updatedData, 'live', fonts, mappingFont));
            return result.html;
        });
    }, [data]);

    // Memoize ratio calculation based on iframe content
    const calculateRatio = useMemo(() => {
        return new Promise((resolve) => {
            const iframeDocument = iframe.current?.contentDocument || iframe.current?.contentWindow.document;
            if (iframeDocument) {
                const contentWidth = iframeDocument.body.scrollWidth;
                const contentHeight = iframeDocument.body.scrollHeight;

                if (contentWidth && contentHeight) {
                    const calculatedRatio = `${contentWidth}:${contentHeight}`;
                    resolve(calculatedRatio);
                } else {
                    resolve('16:9'); // Fallback ratio
                }
            }
        });
    }, [iframe.current]);

    useEffect(() => {
        setIsLoading(true);
        if (iframe.current) {
            mjmlHtml.then(html => {
                iframe.current.contentDocument.body.innerHTML = html;
                calculateRatio.then(calculatedRatio => {
                    setRatio(calculatedRatio);
                });
                setIsLoading(false);
            });
        }
    }, [mjmlHtml, calculateRatio]);

    return (
        <div
            className="mailerpress-preview"
            onClick={() => onClick !== undefined ? onClick() : null}
        >
            <div className="mailerpress-preview__wrapper">
                {isLoading && <Spinner/>}
                <div
                    style={{
                        cursor: onClick !== undefined ? 'pointer' : 'default'
                    }}
                    className={"mailerpress-preview__container"}
                >
                    <div className={"mailerpress-preview__container__content"}>
                        <iframe
                            style={{
                                visibility: isLoading ? 'hidden' : 'visible',
                                height: `calc(${parseInt(ratio.split(':')[1]) * 1.67598}px)`
                            }}
                            ref={iframe}
                            width={"100%"}
                            height={"100%"}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
