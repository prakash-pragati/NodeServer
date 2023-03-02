import { Attribute } from "./attribute.interface";

export interface Event {
    eventInfo : string;
    category : string;
    name : string;
    action : string;
    attributes : Attribute[]; 
}
