import {ChannelType} from "../model";

export class ChannelDto {

    constructor(
        public uuid: string,
        public type: ChannelType,
        public exposed: boolean,
        public participants: string[],
        public title?: string,
        public description?: string,
        public image_url?: string
    ) {
    }
}
