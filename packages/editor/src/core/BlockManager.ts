import {blockType} from "./regisetBlockType.ts";
import {blockType as blockTypeEnum} from './../constants.ts'
import {MjmlToJson} from "../utils/MjmlToJson.ts";
import decode from "unescape"
import {renderToString} from "react-dom/server";
import mjml2html from "mjml-browser";
import {JsonToMjml} from "../utils/JsonToMjml.ts";

export type TPattern = Omit<blockType, 'disabledBlockType' | 'children'>
export type TQueryPattern = Omit<blockType, 'disabledBlockType' | 'children' | 'icon' | 'template'>
export type TTemplate = Omit<blockType, 'edit' | 'disabledBlockType' | 'internal' | 'children' | 'icon' | 'attributes' | 'compiled'>

export default class BlockManager {
    public static blocks: Array<blockType> = [];
    public static patterns: Array<TPattern> = [];
    public static queryPatterns: Array<TQueryPattern> = [];
    public static templates: Array<TTemplate> = [];

    public static setBlock(block: blockType) {
        this.blocks.push({
            ...block
        })
    }

    public static setPatternFromAdmin(pattern) {
        this.patterns.push({
            ...pattern,
            pattern
        })
    }

    public static setPattern(pattern: TPattern) {
        const template = pattern.template()
        if (template !== '') {
            const data = MjmlToJson(pattern.template())
            if (![blockTypeEnum.SECTION].includes(data.type)) {
                throw new Error('Error creating pattern, a pattern need to be wrapped inside at least a section')
            } else {
                this.patterns.push({
                    ...pattern,
                    json: data
                })
            }
        } else {
            this.patterns.push({
                ...pattern,
                compiled: MjmlToJson(
                    decode(
                        wp.element.renderToString(
                            pattern.preview(
                                pattern.init({})
                            )
                        )
                    )
                )
            })
        }

    }

    public static setQueryPattern(qPattern: TQueryPattern) {
        this.queryPatterns.push({
            ...qPattern
        })
    }

    public static setTemplate(template: TTemplate) {
        const data = MjmlToJson(template.template())
        this.templates.push({
            ...template,
            json: data,
            html: mjml2html(JsonToMjml(data)).html
        })

    }

    public static getPatterns(): Array<TPattern> {
        return [
            ...this.patterns,
            ...window.jsVars.savedPatterns.reduce((acc, pattern) => {
                acc.push({
                    postId: pattern.id,
                    database: true,
                    id: `pattern-${pattern.id}`,
                    type: 'pattern',
                    category: pattern.category,
                    name: pattern.title,
                    internal: false,
                    json: JSON.parse(pattern.content),
                    template: () => ''
                })
                return acc
            }, [])
        ]
    }

    public static getQueryPatterns(): Array<TQueryPattern> {
        return this.queryPatterns
    }

    public static getBlocks(): Array<blockType> {
        return this.blocks
    }

    public static getTemplates(): Array<TTemplate> {
        return this.templates
    }

    public static getBlockByType(type: string) {
        return this.blocks.find(b => b.type === type)
    }

    public static getPatternById(id: string) {
        return this.getPatterns().find(b => b.id === id)
    }

    public static getQueryPatternById(id: string) {
        return this.queryPatterns.find(b => b.id === id)
    }

    public static getTemplateById(id: string) {
        return this.templates.find(b => b.id === id)
    }
}