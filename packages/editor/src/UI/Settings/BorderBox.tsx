import {__experimentalBorderBoxControl as BorderBoxControl} from '@wordpress/components';
import {__} from '@wordpress/i18n';
import {useEffect, useState} from "react";
import {border} from "@wordpress/icons";

const colors = [
    {name: 'Blue 20', color: '#72aee6'},
];

export const BorderBox = ({onEdit, attributes, clientId}) => {

    const defaultBorder = {
        style: "solid",
        color: undefined,
        width: undefined,
    };

    const defineBorder = attrs => {
        const splitted = attrs.split(' ')
        return {
            style: splitted[1],
            color: splitted[2],
            width: splitted[0],
        }
    }

    const [borders, setBorders] = useState({});

    useEffect(() => {
        onEdit(borders)
    }, [borders]);

    useEffect(() => {
        setBorders({
            top: attributes['border-top'] ? defineBorder(attributes['border-top']) : defaultBorder,
            right: attributes['border-right'] ? defineBorder(attributes['border-right']) : defaultBorder,
            bottom: attributes['border-bottom'] ? defineBorder(attributes['border-bottom']) : defaultBorder,
            left: attributes['border-left'] ? defineBorder(attributes['border-left']) : defaultBorder,
        })
    }, [clientId, attributes]);

    return (
        <BorderBoxControl
            label={__('Borders')}
            onChange={setBorders}
            value={
                borders || {
                    top: attributes['border-top'] ? defineBorder(attributes['border-top']) : defaultBorder,
                    right: attributes['border-right'] ? defineBorder(attributes['border-right']) : defaultBorder,
                    bottom: attributes['border-bottom'] ? defineBorder(attributes['border-bottom']) : defaultBorder,
                    left: attributes['border-left'] ? defineBorder(attributes['border-left']) : defaultBorder,
                }
            }
        />
    );
};

