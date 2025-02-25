import React, {useEffect, useRef, useState} from "react"
import {useEntityRecords} from "@wordpress/core-data";
import apiFetch from "@wordpress/api-fetch";
import {addQueryArgs} from "@wordpress/url";

const useDtaListSelectot = () => {
    const [selection, setSelection] = useState({
        selected: [],
        isAllOccurrence: false
    })

    const pushToSelection = (newSelection) => {
        setSelection(newSelection)
    }

    return {
        selection,
        pushToSelection
    }
}
export default useDtaListSelectot