import {registerBlockType} from "../../regisetBlockType.ts";
import BasicBlock from "../../../components/BasicBlock.tsx";
import {blockType} from "../../../constants.ts";
import {merge} from "lodash";
import {v4 as uuidv4} from 'uuid';

const preview = (params) => {
    return <BasicBlock params={params} tag="mj-hero"/>;
}

const edit = () => {
    return (
        <div>Edit</div>
    )
}

registerBlockType({
    type: blockType.HERO,
    edit,
    icon: `
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24" aria-hidden="true" focusable="false"><path d="M14.5 17.5H9.5V16H14.5V17.5Z M14.5 8H9.5V6.5H14.5V8Z M7 3.5H17C18.1046 3.5 19 4.39543 19 5.5V9C19 10.1046 18.1046 11 17 11H7C5.89543 11 5 10.1046 5 9V5.5C5 4.39543 5.89543 3.5 7 3.5ZM17 5H7C6.72386 5 6.5 5.22386 6.5 5.5V9C6.5 9.27614 6.72386 9.5 7 9.5H17C17.2761 9.5 17.5 9.27614 17.5 9V5.5C17.5 5.22386 17.2761 5 17 5Z M7 13H17C18.1046 13 19 13.8954 19 15V18.5C19 19.6046 18.1046 20.5 17 20.5H7C5.89543 20.5 5 19.6046 5 18.5V15C5 13.8954 5.89543 13 7 13ZM17 14.5H7C6.72386 14.5 6.5 14.7239 6.5 15V18.5C6.5 18.7761 6.72386 19 7 19H17C17.2761 19 17.5 18.7761 17.5 18.5V15C17.5 14.7239 17.2761 14.5 17 14.5Z"></path></svg>
    `,
    preview,
    name: "Hero",
    disabledBlockType: [blockType.BUTTON, blockType.TEXT, blockType.SECTION, blockType.WRAPPER, blockType.IMAGE, blockType.DIVIDER, blockType.HERO],
    init: (payload) => {
        const defaultData= {
            clientId: uuidv4(),
            type: blockType.HERO,
            data: {},
            attributes: {
                'background-color': '#ffffff',
                'background-position': 'center center',
                mode: 'fluid-height',
                padding: '100px 0px 100px 0px',
                'vertical-align': 'top',
                'background-url': 'https://cloud.githubusercontent.com/assets/1830348/15354890/1442159a-1cf0-11e6-92b1-b861dadf1750.jpg',
            },
            children: [
                {
                    type: blockType.TEXT,
                    data: {
                        value: {
                            content: 'We Serve Healthy &amp; Delicious Foods',
                        },
                    },
                    attributes: {
                        padding: '10px 25px 10px 25px',
                        align: 'center',
                        color: '#ffffff',
                        'font-size': '45px',
                        'line-height': '45px',
                    },
                    children: [],
                    clientId: uuidv4(),

                },
                {
                    clientId: uuidv4(),
                    type: blockType.TEXT,
                    data: {
                        content: 'A small river named Duden flows by their place and supplies it with the necessary regelialia. It is a paradisematic country, in which roasted parts of sentences fly into your mouth.<br>',
                    },
                    attributes: {
                        align: 'center',
                        'background-color': '#414141',
                        color: '#ffffff',
                        'font-weight': 'normal',
                        'border-radius': '3px',
                        padding: '10px 25px 10px 25px',
                        'inner-padding': '10px 25px 10px 25px',
                        'line-height': '1.5',
                        target: '_blank',
                        'vertical-align': 'middle',
                        border: 'none',
                        'text-align': 'center',
                        href: '#',
                        'font-size': '14px',
                    },
                    children: [],
                },
                {
                    clientId: uuidv4(),
                    type: blockType.BUTTON,
                    data: {
                            content: 'Get Your Order Here!',
                    },
                    attributes: {
                        align: 'center',
                        'background-color': '#f3a333',
                        color: '#ffffff',
                        'font-size': '13px',
                        'font-weight': 'normal',
                        'border-radius': '30px',
                        padding: '10px 25px 10px 25px',
                        'inner-padding': '10px 25px 10px 25px',
                        'line-height': '120%',
                        target: '_blank',
                        'vertical-align': 'middle',
                        border: 'none',
                        'text-align': 'center',
                        href: '#',
                    },
                    children: [],
                },
            ],
        };
        return merge(defaultData, payload)
    }
})