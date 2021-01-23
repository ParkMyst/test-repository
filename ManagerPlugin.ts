import {
    BuiltInEvents,
    Component,
    ComponentData,
    ComponentEndEvent,
    ComponentResetEvent,
    dispatchCompleted,
    dispatchComponentEvent,
    dispatchNextComponentEvent,
    getComponentInformation,
    JSONSchema7,
    registerComponent,
    GameEndEvent
} from "./library/parkmyst-1";

interface FinisherData extends ComponentData {
    toFinish: number
}

export class Finisher extends Component<FinisherData> {

    schemaComponentData: JSONSchema7 = {
        "$schema": "http://json-schema.org/draft-07/schema",
        "type": "object",
        "additionalProperties": false,
        "required": [
            "toFinish"
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
            "toFinish": {
                "$ref": "#/definitions/component",
                "title": "Component to finish"
            }
        }
    };


    componentOutputTemplate = {};

    componentStartEvent() {
        dispatchComponentEvent<ComponentEndEvent>({
            type: BuiltInEvents.ComponentEnd,
            data: {
                target: getComponentInformation<FinisherData>().data.toFinish
            }
        });
        dispatchCompleted();
    }

    componentCleanUp() {

    }

    componentCompleted() {
        const component = getComponentInformation<FinisherData>();
        dispatchNextComponentEvent(component.nextComponents)
    }
}

registerComponent(new Finisher());

interface ReseterData extends ComponentData {
    toReset: number
}

export class Reseter extends Component<ReseterData> {

    schemaComponentData: JSONSchema7 = {
        "$schema": "http://json-schema.org/draft-07/schema",
        "type": "object",
        "additionalProperties": false,
        "required": [
            "toReset"
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
            "toReset": {
                "$ref": "#/definitions/component",
                "title": "Component to reset"
            }
        }
    };


    componentOutputTemplate = {};

    componentStartEvent() {
        dispatchComponentEvent<ComponentResetEvent>({
            type: BuiltInEvents.ComponentReset,
            data: {
                target: getComponentInformation<ReseterData>().data.toReset
            }
        });
        dispatchCompleted();
    }

    componentCleanUp() {

    }

    componentCompleted() {
        const component = getComponentInformation<ReseterData>();
        dispatchNextComponentEvent(component.nextComponents)
    }
}

registerComponent(new Reseter());

export class StartNode extends Component {
    schemaComponentData: JSONSchema7 = {
        "$schema": "http://json-schema.org/draft-07/schema",
        "type": "object",
        "additionalProperties": false,
        "required": [],
        "properties": {}
    };
    autoStart = true;

    componentOutputTemplate = {};

    componentCompleted() {
        const component = getComponentInformation();
        dispatchNextComponentEvent(component.nextComponents)
    }

    componentCleanUp() {

    }

    componentStartEvent() {
        dispatchCompleted();
    }
}

registerComponent(new StartNode());

export class EndNode extends Component {
    schemaComponentData: JSONSchema7 = {
        "$schema": "http://json-schema.org/draft-07/schema",
        "type": "object",
        "additionalProperties": false
    };

    componentOutputTemplate = {};

    protected componentCleanUp(): void {

    }

    protected componentCompleted(): void {
        dispatchComponentEvent<GameEndEvent>({
            type: BuiltInEvents.GameEnd,
            data: {}
        })
    }


    protected componentStartEvent(): void {
        dispatchCompleted();
    }
}
registerComponent(new EndNode());
