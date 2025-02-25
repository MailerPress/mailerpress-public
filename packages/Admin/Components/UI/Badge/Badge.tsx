import Styles from './Badge.module.scss'

type BadgeProps = {
    size: string,
    type: string,
    appearance: string;
    label: string,
    light: boolean
    labeled?: boolean,
    lefIcon?: string,
    rightIcon?: string,
}

export function Badge(props: BadgeProps) {
    return (
        <div
            data-labeled={props.labeled}
            data-appearance={props.appearance}
            data-light={props.light}
            data-type={props.type}
            data-size={props.size}
            className={Styles.Badge}
        >
            {props?.lefIcon && <span dangerouslySetInnerHTML={{__html: props.lefIcon}}/>}
            {props.label}
            {props?.rightIcon && <span dangerouslySetInnerHTML={{__html: props.rightIcon}}/>}
        </div>
    )
}