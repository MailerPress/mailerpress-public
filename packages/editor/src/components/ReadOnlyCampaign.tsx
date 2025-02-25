import React, {useEffect, useRef} from "react"
import {__experimentalHStack as HStack} from "@wordpress/components";
import Sidebar from "./Sidebar.tsx";
import mjml2html from "mjml-browser";
import {JsonToMjml} from "../utils/JsonToMjml.ts";
import {maybeRegenerateQuery} from "./ReviewAndSend.tsx";

const ReadOnlyCampaign = ({data}) => {

    const frame = useRef();

    useEffect(() => {
        const result = mjml2html(
            JsonToMjml(data)
        );

        if (frame.current) {
            frame.current.contentDocument.body.innerHTML = result.html;
        }
    }, [frame]);

    return (
        <div style={{
            background: '#f7f7f7',
            display: 'flex',
            justifyContent: 'center',
            padding: 8,
            borderRadius: 8,
            flex: 1,

        }}>
            <HStack spacing={4} alignment={"top"}>
                <div style={{width: '50%', height: '100%', display: 'flex', justifyContent: 'center'}}>
                    <iframe style={{width: '100%', height: '100%'}} ref={frame} frameBorder="0"/>
                </div>
                <div style={{width: '50%', height: '100%', display: 'flex', justifyContent: 'center'}}>
                    lala
                </div>
            </HStack>
        </div>
    )
}
export default ReadOnlyCampaign