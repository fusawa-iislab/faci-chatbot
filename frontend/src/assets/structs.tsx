export type ChatData = {
    name: string;
    content: string;
    id: number;
}


export type Person = {
    name: string;
    id: number;

}

export type Participant = Person & {
    persona: string;
}


