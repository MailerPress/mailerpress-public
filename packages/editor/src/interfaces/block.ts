import {FC} from "react";

export default interface Block {
    type: string,
    clientId: string | null,
    data: object,
    children: Block[],
}