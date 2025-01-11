export type ChatStatus = 'SUCCESS' | 'STOPPED' | 'ERROR';

export type ChatData = {
    name: string;
    content: string;
    id: number;
    status: ChatStatus;
}


export type Person = {
    name: string;
    persona: string;
    id: number;
}

export type PersonDescription = Omit<Person, 'id'>

export type SituationDescription = {
    title: string;
    description?: string;
}

export type SituationTemplate = {
    title: string;
    content: SituationDescription;
}

export type PersonTemplate = {
    title: string;
    type: string;
    content: {
        type: string;  
        args: PersonDescription;
    }
}


