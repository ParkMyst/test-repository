import {
    Component,
    ComponentData,
    ComponentEvent,
    createFeed,
    dispatchCompleted,
    dispatchNextComponentEvent,
    JSONSchema7,
    OutputTemplates,
    PlayerPermission,
    registerComponent,
    removeFeed,
    subscribeToEvent,
    unsubscribeFromEvent,
    useState
} from "./library/parkmyst-1";

interface QuestionData extends ComponentData {
    question: string
    answer: string
    onFail: number
}

interface AnswerEvent extends ComponentEvent {
    type: "simpleAnswer",
    data: {
        answer: string,
    }
}

function isAnswerEvent(event: ComponentEvent): event is AnswerEvent {
    return event.type === "simpleAnswer"
        && typeof event.data.answer === "string";
}

interface SimpleQuestionContext {
    feedId: string
}

export class SimpleQuestion extends Component<QuestionData> {
    schemaComponentData: JSONSchema7 = {
        "$schema": "http://json-schema.org/draft-07/schema",
        "type": "object",
        "additionalProperties": false,
        "required": [
            "question",
            "answer",
            "matchPercentage",
            "onFail"
        ],
        "definitions": {
            "component": {
                "$id": "#/definitions/component",
                "type": "number",
                "title": "Next component",
                "default": -1,
                "minimum": -1,
                "format": "parkmyst-id"
            }
        },
        "properties": {
            "question": {
                "$id": "#/properties/question",
                "type": "string",
                "title": "Question",
                "default": "Default question!"
            },
            "answer": {
                "$id": "#/properties/answer",
                "type": "string",
                "title": "Answer",
                "default": "Default answer"
            },
            "onFail": {
                "$ref": "#/definitions/component",
                "title": "Component on fail",
            }
        }
    };

    componentOutputTemplate: OutputTemplates = {
        simpleQuestion: {
            example: {
                question: "This is a question?"
            },
            display:
                `<form>
    <p>
        {{question}}
    </p>
    <input type="text" name="answer">
    <input type="submit" inputtype="simpleAnswer"/>
</form>`,
            permission: PlayerPermission.User
        }
    };

    constructor() {
        super();
        this.registerSafeEventListeners("simpleAnswer", this.handleSimpleAnswer, isAnswerEvent);
    }

    componentStartEvent() {
        subscribeToEvent("simpleAnswer")
        const component = this.getComponentInformation();
        const [, setContext] = useState<SimpleQuestionContext>();

        const ctx: SimpleQuestionContext = {
            feedId: createFeed("simpleQuestion", {
                question: component.data.question
            })
        };

        setContext(ctx);
    }

    componentCleanUp() {
        const [ctx,] = useState<SimpleQuestionContext>();
        unsubscribeFromEvent("simpleAnswer")
        removeFeed(ctx.feedId);
    }

    componentCompleted() {
        const data = this.getComponentInformation();
        dispatchNextComponentEvent(data.nextComponents);
    }

    handleSimpleAnswer = (event: AnswerEvent) => {
        const answer = event.data.answer;
        const component = this.getComponentInformation();
        if (answer === component.data.answer) {
            dispatchCompleted();
        } else {
            dispatchNextComponentEvent(component.data.onFail);
        }
    }

}

registerComponent(new SimpleQuestion());