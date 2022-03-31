import {EventSubscriber, EntitySubscriberInterface, UpdateEvent} from 'typeorm';
import {Pot} from './entity/pot.entity';
import {PotService} from './services/pot.service';
import {Notification} from './push-notification/notification';
import {Publisher} from './push-notification';
import {AppContainer} from './commons/app.container';

@EventSubscriber()
export class PotSubscriber implements EntitySubscriberInterface<Pot> {

    constructor(private potService: PotService) {}
    /**
     * Indicates that this subscriber only listen to Pot events.
     */
    listenTo() {
        return Pot;
    }

    /**
     * Called after pot update.
     */
    async afterUpdate(event: UpdateEvent<Pot>) {
        let notification: Notification;
        this.potService = AppContainer.getService('PotService');

        notification = new Notification(Publisher);
        notification.setTitle('Receive notification from Pot')
            .setMessage('Pot sensor data updated')
            .setDomain('pots')
            .setType('info')
            .setTargets([event.entity.id])
            .setFrom(event.entity.id)
            .setData(event.entity);
        notification.publish();
    }
}
