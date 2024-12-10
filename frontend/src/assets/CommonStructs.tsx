export type ChatData = {
    name: string;
    content: string;
    id: number;
}


export type Person = {
    name: string;
    persona: string;
    id: number;

}

export type PersonDescription = Omit<Person, 'id'>


