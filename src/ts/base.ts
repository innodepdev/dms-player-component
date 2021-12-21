import { render, JSX } from 'preact';
import { CreatePlayerOptions } from '@interfaces/player-interface';

export default abstract class Base {
    private container: Element;
    private base?: Element;

    public constructor(container: Element) {
        this.container = container;
    }

    protected abstract getComponent(options: CreatePlayerOptions): JSX.Element;

    public render(options: CreatePlayerOptions): void {
        render(this.getComponent(options), this.container, this.base);
    }

    public destroy(): void {
        render(null, this.container, this.base);
    }
}