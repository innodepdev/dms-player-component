import Player from '@ts/player';

const getVersion = (): void => {
    console.log('%c dms-player-component Version: %c ' + '1.0.16' + ' ', 'background-color:#000000; color:#fff; font-size:15px;',
        'background-color:#0068b4; color:#fff; font-size:15px;');
};

export default {
    Player,
    getVersion
};

export { Player, getVersion };
