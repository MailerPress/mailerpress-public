import {FC} from "react";
import BlockManager, {TPattern, TQueryPattern} from "./BlockManager.ts";
import {v4 as uuidv4} from 'uuid';
import slugify from "slugify";

export type blockType = {
    id?: string | null,
    type?: string,
    init?: Function,
    disabledBlockType: Array<string>
    internal?: boolean,
    icon?: string
    name: string,
    preview?: FC,
    edit?: FC,
    template?: Function
    attributes?: object,
    mobileAttributes?: object,
    children?: Array<blockType>,
    json?: object,
    compiled?: object,
    category?: string,
    html?: string,
    description?: string,
    lock?: boolean,
    custom?: boolean,
}
const registerBlockType = ({
                               icon,
                               init,
                               type,
                               name,
                               preview,
                               attributes,
                               mobileAttributes,
                               children,
                               edit,
                               internal,
                               disabledBlockType,
                               description,
                               lock = false,
                               custom = false
                           }: blockType) => {
    BlockManager.setBlock(
        {
            custom,
            icon,
            description,
            type,
            disabledBlockType: disabledBlockType || [],
            name,
            internal,
            attributes,
            mobileAttributes,
            edit,
            preview,
            children,
            init,
            lock
        },
    )
}
const registerPattern = ({
                             icon,
                             init,
                             type = 'pattern',
                             name,
                             preview,
                             attributes,
                             edit,
                             template,
                             category,
                             internal = false,
                             lock = false,
                         }: TPattern) => {
    BlockManager.setPattern(
        {
            id: `pattern-${slugify(name, {lower: true, replacement: '-',})}`,
            icon,
            type,
            name,
            attributes,
            edit,
            preview,
            init,
            category,
            internal,
            template: template !== undefined ? template : () => '',
            lock
        },
    )
}

const registerQueryPattern = ({
                                  id,
                                  init,
                                  type = 'query-pattern',
                                  name,
                                  description,
                                  attributes,
                                  mobileAttributes,
                                  category,
                                  internal = true,
                                  preview,
                                  edit,
                                  lock
                              }: TQueryPattern) => {
    BlockManager.setQueryPattern(
        {
            id: id !== undefined ? `query-pattern-${id}` : `query-pattern-${slugify(name, {
                lower: true,
                replacement: '-',
            })}`,
            type,
            description,
            name,
            attributes,
            mobileAttributes,
            preview,
            init,
            category,
            internal,
            edit,
            lock
        },
    )
}
const registerTemplate = ({type = 'template', name, preview, template, category, html}: TPattern) => {
    BlockManager.setTemplate(
        {
            id: uuidv4(),
            type,
            name,
            preview,
            category,
            template: template !== undefined ? template : () => '',
            html
        },
    )
}

export {registerBlockType, registerPattern, registerTemplate, registerQueryPattern}
