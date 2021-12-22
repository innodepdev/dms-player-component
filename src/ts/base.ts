import {render, JSX} from 'preact';
import {CreatePlayerOptions} from '@interfaces/player-interface';

import {playerClose} from 'dms-player';
export default abstract class Base {
    private container: Element;
    private base?: Element;
    private playerUrl?: string;

    public constructor(container: Element) {
        this.container = container;
    }

    protected abstract getComponent(options: CreatePlayerOptions): JSX.Element;

    public render(options: CreatePlayerOptions): void {
        this.playerUrl = options.url;
        render(this.getComponent(options), this.container, this.base);
    }

    public destroy(): void {
        const video = this.container.querySelector('video') as HTMLVideoElement;
        if (video && this.playerUrl) {
            playerClose(video, this.playerUrl)
            render(null, this.container, this.base);
        }
    }
}