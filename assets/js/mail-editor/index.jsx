import * as Editor from '../../../packages/editor/src/core/Editor.tsx'
import domReady from "@wordpress/dom-ready";
import '../../../packages/editor/index.ts'
import {createRoot} from "react-dom/client";
import App from "../../../packages/Admin/App.tsx";
domReady(() => {
    /** Builder mount point **/
    const editor = document.getElementById('mailerpress-root');
    if (editor) {
        Editor.initializeEditor(editor)
    }

    /** Listing campaigns mount point **/
    const listingCampaigns = document.getElementById('mailerpress');
    if (listingCampaigns) {
        const root = createRoot(listingCampaigns)
        root.render(<App/>)
    }

});