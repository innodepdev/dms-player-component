import {h, JSX} from 'preact';
import Base from '@ts/base';

import {CreatePlayerOptions} from '@interfaces/player-interface';

import {PlayerWrap} from '@ts/components/playerWrap';

class Player extends Base {
	protected getComponent(options: CreatePlayerOptions): JSX.Element {
		return (
			<PlayerWrap options={options} />
		);
	}
}

export default Player;
