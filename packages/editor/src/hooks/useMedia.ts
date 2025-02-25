import {useEffect, useRef, useState} from 'react';

export function useMedia() {
    let frame;
    const [state, setState] = useState(null);
    const open = (event) => {
        event.preventDefault()

        // If the media frame already exists, reopen it.
        if (frame) {
            frame.open()
            return
        }

        // Create a new media frame
        frame = wp.media({
            title: 'Select or Upload Media Of Your Chosen Persuasion',
            button: {
                text: 'Use this media',
            },
            multiple: false, // Set to true to allow multiple files to be selected
        })

        frame.on( 'select', function() {
            // We set multiple to false so only get one image from the uploader
            const attachment = frame.state().get('selection').first().toJSON();
            setState(attachment)
        });

        // Finally, open the modal on click
        frame.open()
    }

    return {
        state,
        open
    }
}
