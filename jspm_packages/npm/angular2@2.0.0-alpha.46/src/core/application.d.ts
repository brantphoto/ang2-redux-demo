import { Provider } from './di';
import { Type } from 'angular2/src/facade/lang';
import { Promise } from 'angular2/src/facade/async';
import { ComponentRef } from './linker/dynamic_component_loader';
export { APP_COMPONENT, APP_ID } from './application_tokens';
export { platform } from './application_common';
export { PlatformRef, ApplicationRef, applicationCommonProviders, createNgZone, platformCommon, platformProviders } from './application_ref';
export declare function bootstrap(appComponentType: any, appProviders?: Array<Type | Provider | any[]>): Promise<ComponentRef>;
