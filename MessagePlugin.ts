import {
    BuiltInEvents,
    Component,
    ComponentData,
    createFeed,
    dispatchNextComponentEvent,
    getComponentInformation,
    JSONSchema7,
    OutputTemplates,
    registerComponent,
    removeFeed,
    subscribeToEvent,
    unsubscribeFromEvent,
    updateStatus,
    useState
} from "./library/parkmyst-1";

interface HtmlMessageData extends ComponentData {
    message: string
}

interface FeedContext {
    messageId: string
}

export class HtmlMessage extends Component<HtmlMessageData> {

    schema: JSONSchema7 = {
        "$schema": "http://json-schema.org/draft-07/schema",
        "type": "object",
        "additionalProperties": false,
        "required": [
            "message"
        ],
        "properties": {
            "message": {
                "$id": "#/properties/message",
                "type": "string",
                "title": "Html message",
                "default": "<h1>Default message</h1>"
            }
        }
    };

    doCleanUpOnCompletion = false;
    defaultCleanUpEnabled = false;

    outputTemplates: OutputTemplates = {
        message: {
            example: {
                message: "Example message!"
            },
            template: `<div>
    <p>{{message}}</p>
</div>`
        }
    };

    componentStartEvent = () => {
        const component = getComponentInformation<HtmlMessageData>();
        const [, setCtx] = useState<FeedContext>();

        const feedId = createFeed("message", {
            message: component.data.message
        });
        setCtx({ messageId: feedId });

        dispatchNextComponentEvent(component.nextComponents);
    }

    componentCleanUp = () => {
        const [ctx,] = useState<FeedContext>();
        removeFeed(ctx.messageId);
        updateStatus("idle");
        subscribeToEvent(BuiltInEvents.ComponentStart)
        unsubscribeFromEvent(BuiltInEvents.ComponentReset);
        unsubscribeFromEvent(BuiltInEvents.ComponentEnd);
    }

    componentCompleted = () => {

    }
}

registerComponent(new HtmlMessage());
