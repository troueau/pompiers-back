export const enum EventOperation {
    CREATED = "CREATED",
    MODIFIED = "MODIFIED",
    DELETED = "DELETED",
}

export const enum EventElement {
    INTERVENTION = "INTERVENTION",
    MOYEN = "MOYEN",
    ACTION = "ACTION",
    ZONE_ACTION = "ZONE_ACTION",
    POINT_ATTENTION = "POINT_ATTENTION",
    TRAJECTOIRE = "TRAJECTOIRE",
}

export function getEventCode(operation: EventOperation, element: EventElement, id?: string): string {
    if (id != null) {
        return operation + "_" + element + "_" + id;
    } else {
        return operation + "_" + element;
    }
}