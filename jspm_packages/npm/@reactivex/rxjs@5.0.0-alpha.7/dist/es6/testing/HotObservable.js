/* */ 
"format cjs";
import Subject from '../Subject';
import Subscription from '../Subscription';
import SubscriptionLoggable from './SubscriptionLoggable';
import applyMixins from '../util/applyMixins';
export default class HotObservable extends Subject {
    constructor(messages, scheduler) {
        super();
        this.messages = messages;
        this.subscriptions = [];
        this.scheduler = scheduler;
    }
    _subscribe(subscriber) {
        const subject = this;
        const index = subject.logSubscribedFrame();
        subscriber.add(new Subscription(() => {
            subject.logUnsubscribedFrame(index);
        }));
        return super._subscribe(subscriber);
    }
    setup() {
        const subject = this;
        const messagesLength = subject.messages.length;
        for (let i = 0; i < messagesLength; i++) {
            const message = subject.messages[i];
            this.scheduler.schedule(() => { message.notification.observe(subject); }, message.frame);
        }
    }
}
applyMixins(HotObservable, [SubscriptionLoggable]);
//# sourceMappingURL=HotObservable.js.map