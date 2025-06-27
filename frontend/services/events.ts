
import { $ } from './dom';

export function on(selector: string, event: keyof HTMLElementEventMap, handler: (e: Event) => void) {
    const element = $(selector);
    if (element) {
        element.addEventListener(event, handler);
    }
}
