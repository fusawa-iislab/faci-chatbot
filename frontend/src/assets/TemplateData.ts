import { SituationTemplate,PersonTemplate } from "./CommonStructs";



export const SituationTemplates: SituationTemplate[] = [
    {
        title: "薬物使用経験についての会話",
        content: {
            "title": "薬物依存治療グループセラピー",
            "description": "薬物依存症の人が集まってファシリテータのもと、薬物の使用経験について話し合います。"
        }
    },
]

export const PersonTemplates: PersonTemplate[] = [
    {
        title: "紋切り型の人",
        content: {
            name: "B",
            persona: "少しシャイで自分のことを話すのが苦手な性格,紋切り型の返事をし、少しぶっきらぼうな話し方をする"
        }
    },
    {
        title: "使ったばかりの人",
        content: {
            name: "A",
            persona: "昨日ちょうど薬物を使用してしまった。セッションに参加するがなかなかやめられない。自身の薬物使用の様子について生々しい表現をし、薬物を使用することによる高揚感を楽しげに表現する"
        }
    },
    {
        title: "いやいや来る人",
        content: {
            name: "C",
            persona: "毎回セッションに参加してくれるがあまり乗り気ではない。薬物使用についてはあまり話したがらない"
        }
    },
    {
        title: "薬物使用経験者",
        content: {
            name: "test",
            persona: "過去に薬物使用の経験がある。現在は薬物を使用していないが、薬物使用についての話には参加し、周りの人の役に立つような話をする"
        }
    }
]