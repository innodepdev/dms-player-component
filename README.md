# [dms-player-component.js](https://innodep.co.kr/renew/)

[![npm version](https://img.shields.io/npm/v/dms-player-component.svg?style=flat-square)](https://www.npmjs.com/package/dms-player-component)
[![npm downloads](https://img.shields.io/npm/dm/dms-player-component.svg?style=flat-square)](https://www.npmjs.com/package/dms-player-component)
[![size](https://img.shields.io/bundlephobia/minzip/dms-player-component.svg?style=flat)](https://bundlephobia.com/result?p=dms-player-component)

dms-player-component 는 [**이노뎁(주)**](http://www.innodep.com/)의 [dms-player](https://www.npmjs.com/package/dms-player) 영상 연동 모듈을 활용한 preact 기반 컴포넌트 라이브러리 입니다.

## 🚩 Table of Contents
- [Install](#install)
- [Usage](#usage)

## Install

<PRE style="padding: 16px;overflow: auto;font-size: 85%;line-height: 1.45;background-color: #e2e2e2;border-radius: 3px;">
$ npm install --save dms-player-component # Latest Version
$ npm install --save dms-player-component@<version> # Specific Version
</PRE>

## Usage

- ES6 Modules
``` sh
import dmsPlayerComponent from 'dms-player-component';
```
- CommonJS
``` sh
const dmsPlayerComponent = require('dms-player-component');
```

```js
...
<body>
  ...
  <div id="player"></div> 
</body>
...

// create player component
const options = {
  parentElementId: 'player',              // video 태그가 위치 할 부모 element ID
  id: 'dms_video_1',                      // 생성대상 플레이어의 ID 지정
  vms_id: '100111',                       // 영상정보: vms_id 
  dev_serial: '1',                        // 영상정보: dev_serial
  channel: '0',                           // 영상정보: Channel
  media: '0',                             // 영상정보: media
  srcType: 'vurix',                       // 원본소스타입: vurix, realhub
  protocol: 'http',                       // media server url: 프로토콜 정보, http/https
  host: 'ca-172-16-36-180.vurix.kr',      // media server url: host 정보, 접속 host url 또는 사용 할 media server host url
  transcode: 720,                         // 인코딩 요청 값: -1=인코딩 적용 X, 0=원본, [-1, 0을 제외한 최소 값은 32]
  startDate: 1639618920,                  // 저장영상 재생: 시작 UTC 시간(실시간일 경우 X)
  endDate: 1639619520,                    // 저장영상 재생: 종료 UTC 시간(실시간일 경우 X)
  autoPlay: true,                         // 자동재생: true/false
  snapshot: true,                         // progress bar 마우스 이동 시, 스냅샷 처리 여부
  capture: true,                          // 화면 캡쳐 버튼 활성화 여부
  searchDate: true,                       // 저장영상 검색 기능(미구현)
  scale: 10,                              // progress bar 아래 scale 표시 여부(scale 눈금 갯수)
  errorMsgFunc: ((err) => {               // 에러 발생 콜백
    console.error(err);
  })
};
  
const playerInstance = new dmsPlayerComponent.Player(document.getElementById('player'));
playerInstance.render(options1);
  
// remove player component
playerInstance.destroy();
```