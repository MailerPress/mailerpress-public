import {FocalPointPicker} from '@wordpress/components';
import {useEffect, useState} from "react";
import SettingRow from "../SettingRow.tsx";

export function BackgroundPosition({url, onChange, label}) {
    const [focalPoint, setFocalPoint] = useState({
        x: 0.5,
        y: 0.5,
    });


    const style = {
        backgroundImage: `url(${url})`,
        backgroundPosition: `${focalPoint.x * 100}% ${focalPoint.y * 100}%`,
    };

    useEffect(() => {
        onChange(focalPoint)
    }, [focalPoint]);

    return (
        <SettingRow>
            <FocalPointPicker
                label={label}
                url={url}
                value={focalPoint}
                onDragStart={setFocalPoint}
                onDrag={setFocalPoint}
                onChange={setFocalPoint}
            />
            <div style={style}/>
        </SettingRow>
    );
}