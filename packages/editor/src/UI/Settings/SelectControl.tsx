import {SelectControl as WpSelectControl} from "@wordpress/components";
import {t} from "../../utils/function.ts";
import SettingRow from "../SettingRow.tsx";

export function SelectControl({options, onChange, label, value}) {
    return (
        <SettingRow>
            <WpSelectControl
                value={value}
                label={t(label)}
                onChange={onChange}
                options={options}
            />
        </SettingRow>
    )
}