import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { RETableComponent } from "./components/re_table.component";
import { REFormComponent } from "./components/re_form.component";
import { MODES, FormState } from "./models/sharedState.model";
import { Subject } from "rxjs";
import { FormStatePipe } from "./pipes/form_state.pipe";
import { MessageService } from "./services/message.service";
import { ProductRepository } from "src/models/Product/product.repository";
import { Message } from "./models/message.model";
import { MESSAGE_SERVICE, PRODUCT_REPOSITORY, SUBJECT_FACTORY, SUBJECT_INSTANCE } from "./tokens/re.tokens";
import { MessagePanelComponent } from "./components/re_message_panel.component";
import { ReactiveExtensionsComponent } from "./components/reactive_extensions.component";

// --------------- Reactive Extensions

// - RETableComponent объявляет зависимость: 
//      @Inject(SUBJECT_INSTANCE) private observer: Observer<FormState>

// - REFormComponent объявляет зависимость:
//      @Inject(SUBJECT_INSTANCE) private stateEvents: Observable<FormState>

// - Subject реализует функциональность обоих классов Observer и Observable, что дает 
//      возможность создавать службы способные отправлять и получать события 

@NgModule({
    imports: [BrowserModule, FormsModule],
    declarations: [RETableComponent, REFormComponent, MessagePanelComponent, ReactiveExtensionsComponent, FormStatePipe],
    exports: [ReactiveExtensionsComponent, MessagePanelComponent],
    providers: [
        {
            provide: PRODUCT_REPOSITORY,
            useValue: new ProductRepository()
        },
        {
            // для разрешения зависимости от маркера SUBJECT_INSTANCE используется объект Subject<FormState>,
            //      который позволяет компоненту RETableComponent отправлять уведомления, а компоненту 
            //      REFormComponent получать эти уведомления
            provide: SUBJECT_INSTANCE,
            useValue: new Subject<FormState>()
        },
        {
            provide: MESSAGE_SERVICE,
            deps: [SUBJECT_INSTANCE],
            useFactory: (subject: Subject<Message>) => {
                return new MessageService(subject);
            },
        },
        {
            provide: SUBJECT_FACTORY,
            deps: [MESSAGE_SERVICE, PRODUCT_REPOSITORY],
            useFactory: (messageService: MessageService, productRepository: ProductRepository) => {

                // фабричная функция создает объект Subject, который позволяет отправлять уведомления
                let subject = new Subject<FormState>();

                // подписка на уведомления
                subject.subscribe((state: FormState) => {
                    console.log('--- RE --- subscribe --- module ---');
                    if (state && state.id != undefined) {
                        let product = productRepository.getProduct(state.id);
                        if (product) {

                            // передача уведомлений в службу отправки сообщений
                            let message = new Message(MODES[state.mode] + (state.id != undefined ? ` ${product.name}` : ""));
                            messageService.sendMessage(message);
                        }
                    }
                });
                return subject;
            }
        }
    ]
})
export class ReactiveExtensionsModule { }