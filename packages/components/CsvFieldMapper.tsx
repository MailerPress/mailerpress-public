import React, {useMemo} from "react";
import {
    SelectControl,
    __experimentalVStack as VStack,
    __experimentalText as Text
} from "@wordpress/components";
import cx from "classnames/bind";
import {__} from '@wordpress/i18n';

const SelectMapper = ({key, help, options, label, onChange}) => {
    return (
        <SelectControl
            __nextHasNoMarginBottom={true}
            key={key}
            help={help}
            label={label}
            options={options}
            onChange={onChange}
        />
    )
}

const CsvFieldMapper = ({columns, fields, onMapChange, columnMapped, data, mapping}) => {

    const getTopValuesByKey = (data, count = 3) => {
        const result = {};
        // Parcourir toutes les clés du premier objet
        Object.keys(data[0]).forEach((key) => {
            result[key] = data
                .map((item) => item[key]) // Extraire les valeurs pour chaque clé
                .filter((value) => value) // Filtrer les valeurs non vides
                .slice(0, count); // Garder uniquement les `count` premières
        });

        return result;
    };

    const firstValues = useMemo(() => {
        return getTopValuesByKey(data, 3)
    }, [data]);

    return (
        <div className="csv-mapper">
            {columns.map((column) => (
                    <div key={column} className={cx({
                        "field-mapping": true,
                        "field-mapping__mapped": columnMapped.includes(column),
                    })}>
                        <label>
                            {column.replace(/"/g, '')}
                            <VStack spacing={1} expanded={false} justify={"flex-start"}>
                                {firstValues[column].map(value => <Text variant={"muted"}>{value.replace(/"/g, '')}</Text>)}
                            </VStack>
                        </label>
                        <SelectMapper
                            label={__('Select a choice', 'mailerpress')}
                            help={``}
                            key={column}
                            options={
                                fields.map(f => {
                                    if (
                                        mapping &&
                                        Object.keys(mapping).reduce((acc, key) => {
                                            const newKey = key.split(':')[0]; // Keep only the part before the colon
                                            acc.push(newKey); // Add the transformed key to an array
                                            return acc;
                                        }, []).includes(f.value)
                                    ) {
                                        return {
                                            ...f,
                                            disabled: true
                                        };
                                    }
                                    return f;
                                })
                            }
                            onChange={val => onMapChange(val, column)}
                        />

                    </div>
                )
            )}

        </div>
    )

};

export default CsvFieldMapper;
