import {
    Component,
    ComponentData,
    ComponentEvent,
    createFeed,
    dispatchCompleted,
    dispatchNextComponentEvent,
    JSONSchema7,
    OutputTemplates,
    registerComponent,
    removeFeed,
    subscribeToEvent,
    unsubscribeFromEvent
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

interface SimpleQuestionState {
    feedId: string
}

export class SimpleQuestion extends Component<QuestionData, SimpleQuestionState> {
    schema: JSONSchema7 = {
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

    outputTemplates: OutputTemplates = {
        simpleQuestion: {
            example: {
                question: "This is a question?"
            },
            template:
                `<form>
    <p>
        {{question}}
    </p>
    <input type="text" name="answer">
    <input type="submit" inputtype="simpleAnswer"/>
</form>`
        }
    };

    constructor() {
        super();
        this.registerSafeEventListeners("simpleAnswer", this.handleSimpleAnswer, isAnswerEvent);
    }

    componentStartEvent = () => {
        subscribeToEvent("simpleAnswer")
        const component = this.getInformation();
        const [, setContext] = this.useState();

        const ctx: SimpleQuestionState = {
            feedId: createFeed("simpleQuestion", {
                question: component.data.question
            })
        };

        setContext(ctx);
    }

    componentCleanUp = () => {
        const [ctx,] = this.useState();
        unsubscribeFromEvent("simpleAnswer")
        removeFeed(ctx.feedId);
    }

    componentCompleted = () => {
        const data = this.getInformation();
        dispatchNextComponentEvent(data.nextComponents);
    }

    handleSimpleAnswer = (event: AnswerEvent) => {
        const answer = event.data.answer;
        const component = this.getInformation();
        if (answer === component.data.answer) {
            dispatchCompleted();
        } else {
            dispatchNextComponentEvent(component.data.onFail);
        }
    }

}

registerComponent(new SimpleQuestion());
