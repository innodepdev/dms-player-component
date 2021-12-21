import moment from 'moment';

/**
 * 이미지 캡쳐 다운로드
 */
 export const exportImage = (player: HTMLVideoElement | null): void => {
    if (player) {
        const canvas = document.createElement('canvas') as HTMLCanvasElement;
        canvas.width = 1920;
        canvas.height = 1080;
        canvas.getContext('2d')?.drawImage(player as HTMLVideoElement, 0, 0, canvas.width, canvas.height);
        const link = document.createElement('a');
        link.href = canvas.toDataURL();
        link.download = `dms-player-${moment(new Date()).format('YYYYMMDDHHmmss')}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        alert('재생중인 영상이 없습니다.');
    }
};

/**
 * UTC Date -> format ex) YYYY-MM-DD HH:mm:ss => string 변환
 */
 export const utcToDateString = (utcDate?: number, format?: string): string => {
    return moment(new Date(Number(utcDate + '000'))).format(format ? format : 'HH:mm:ss');
};