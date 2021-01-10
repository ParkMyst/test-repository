import {
    BuiltInEvents,
    Component,
    ComponentData,
    createFeed,
    dispatchNextComponentEvent,
    getComponentInformation,
    JSONSchema7,
    OutputTemplates,
    PlayerPermission,
    registerComponent,
    removeFeed, subscribeToEvent, unsubscribeFromEvent, updateStatus,
    useState
} from "./library/parkmyst-1";

interface HtmlMessageData extends ComponentData {
    message: string
    nextComponent: number
}

interface FeedContext {
    messageId: string
}

export class HtmlMessage extends Component<HtmlMessageData> {

    schemaComponentData: JSONSchema7 = {
        "$schema": "http://json-schema.org/draft-07/schema",
        "type": "object",
        "additionalProperties": false,
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
        "required": [
            "message",
            "nextComponent"
        ],
        "properties": {
            "message": {
                "$id": "#/properties/message",
                "type": "string",
                "title": "Html message",
                "default": "<h1>Default message</h1>"
            },
            "nextComponent": {
                "$ref": "#/definitions/component"
            }
        }
    };

    doCleanUpOnCompletion = false;
    defaultCleanUpEnabled = false;

    componentOutputTemplate: OutputTemplates = {
        message: {
            example: {
                message: "Example message!"
            },
            display: `<div>
    <p>{{message}}</p>
</div>`,
            permission: PlayerPermission.User
        }
    };

    componentStartEvent() {
        const component = getComponentInformation<HtmlMessageData>();
        const [, setCtx] = useState<FeedContext>();

        const feedId = createFeed("message", {
            message: component.data.message
        });
        setCtx({ messageId: feedId });

        dispatchNextComponentEvent(component.data.nextComponent);
    }

    componentCleanUp() {
        const [ctx,] = useState<FeedContext>();
        removeFeed(ctx.messageId);
        updateStatus("idle");
        subscribeToEvent(BuiltInEvents.ComponentStart)
        unsubscribeFromEvent(BuiltInEvents.ComponentReset);
        unsubscribeFromEvent(BuiltInEvents.ComponentEnd);
    }

    componentCompleted() {

    }
}

registerComponent(new HtmlMessage());